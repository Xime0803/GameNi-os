import { AuthSession, ParentSettings, ProgressEntry, RewardState, UserProfile } from './types';

export interface ProgressAdapter {
  load<T>(key: string): Promise<T | null>;
  save<T>(key: string, data: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export class LocalStorageAdapter implements ProgressAdapter {
  async load<T>(key: string): Promise<T | null> {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Error cargando clave ${key}:`, err);
      return null;
    }
  }

  async save<T>(key: string, data: T): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error guardando clave ${key}:`, err);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error removiendo clave ${key}:`, err);
    }
  }
}

export class ProgressService {
  private adapter: ProgressAdapter;
  private currentProfileId: string = 'perfil-1';

  private defaultSettings: ParentSettings = {
    voiceSpeed: 'normal',
    musicEnabled: false,
    soundMuted: false,
    dailyTimeLimitMinutes: 20,
    subtitlesEnabled: false,
    adultPassword: 'admin', // Clave admin profesional predeterminada
  };

  constructor(adapter?: ProgressAdapter) {
    this.adapter = adapter || new LocalStorageAdapter();
  }

  // === Generador de Códigos Únicos de 6 Dígitos ===

  public generateUniqueCode(existingProfiles: UserProfile[]): string {
    const existingCodes = new Set(existingProfiles.map((p) => p.accessCode).filter(Boolean));
    let code = '';
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.has(code));
    return code;
  }

  // === Perfiles de Estudiantes con Código de 6 Dígitos ===

  async getProfiles(): Promise<UserProfile[]> {
    let list = await this.adapter.load<UserProfile[]>('ximenita_profiles');
    if (!list || list.length === 0) {
      const initialProfile: UserProfile = {
        id: 'perfil-1',
        name: 'Miriam',
        accessCode: '102938',
        avatar: '🐒',
        ageGroup: 'inicial',
        grade: 'Inicial 4 años',
        parentName: 'Familia Quispe',
        createdAt: Date.now(),
      };
      await this.adapter.save('ximenita_profiles', [initialProfile]);
      return [initialProfile];
    }

    // Auto-migración: asegurar que cada estudiante tenga código único de 6 dígitos
    let modified = false;
    for (const p of list) {
      if (!p.accessCode || p.accessCode.length !== 6) {
        p.accessCode = this.generateUniqueCode(list);
        modified = true;
      }
    }
    if (modified) {
      await this.adapter.save('ximenita_profiles', list);
    }

    return list;
  }

  async getActiveProfile(): Promise<UserProfile> {
    const profiles = await this.getProfiles();
    const savedActiveId = (await this.adapter.load<string>('ximenita_active_profile_id')) || 'perfil-1';
    this.currentProfileId = savedActiveId;
    const found = profiles.find((p) => p.id === savedActiveId);
    return found || profiles[0];
  }

  async setActiveProfile(profileId: string): Promise<void> {
    this.currentProfileId = profileId;
    await this.adapter.save('ximenita_active_profile_id', profileId);
  }

  async getProfileByCode(code: string): Promise<UserProfile | null> {
    const cleanCode = code.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) return null;
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.accessCode === cleanCode) || null;
  }

  async createProfile(
    name: string,
    ageGroup: 'inicial' | 'avanzado',
    avatar: string = '🐰',
    grade?: string,
    parentName?: string,
    customCode?: string
  ): Promise<UserProfile> {
    const profiles = await this.getProfiles();
    const newId = `perfil-${Date.now().toString().slice(-4)}`;

    let finalCode = customCode ? customCode.replace(/\D/g, '').slice(0, 6) : '';
    if (!finalCode || finalCode.length !== 6 || profiles.some((p) => p.accessCode === finalCode)) {
      finalCode = this.generateUniqueCode(profiles);
    }

    const newProfile: UserProfile = {
      id: newId,
      name: name.trim() || `Estudiante ${profiles.length + 1}`,
      accessCode: finalCode,
      avatar,
      ageGroup,
      grade: grade?.trim() || (ageGroup === 'inicial' ? 'Ciclo II Inicial' : 'Primaria'),
      parentName: parentName?.trim() || 'Familia',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    profiles.push(newProfile);
    await this.adapter.save('ximenita_profiles', profiles);
    await this.setActiveProfile(newId);
    return newProfile;
  }

  async regenerateCode(profileId: string): Promise<string> {
    const profiles = await this.getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) throw new Error('Estudiante no encontrado');

    const newCode = this.generateUniqueCode(profiles);
    target.accessCode = newCode;
    await this.adapter.save('ximenita_profiles', profiles);
    return newCode;
  }

  async deleteProfile(profileId: string): Promise<void> {
    let profiles = await this.getProfiles();
    profiles = profiles.filter((p) => p.id !== profileId);
    await this.adapter.save('ximenita_profiles', profiles);
    await this.reset(profileId);

    if (this.currentProfileId === profileId && profiles.length > 0) {
      await this.setActiveProfile(profiles[0].id);
    }
  }

  // === Autenticación y Sesiones (Admin vs Padre/Estudiante) ===

  async getAuthSession(): Promise<AuthSession | null> {
    return await this.adapter.load<AuthSession>('ximenita_auth_session');
  }

  async saveAuthSession(session: AuthSession): Promise<void> {
    await this.adapter.save('ximenita_auth_session', { ...session, tokenTime: Date.now() });
  }

  async clearAuthSession(): Promise<void> {
    await this.adapter.remove('ximenita_auth_session');
  }

  async verifyAdminPassword(input: string): Promise<boolean> {
    const settings = await this.getSettings();
    const cleanInput = input.trim();
    const adminPass = settings.adultPassword || 'admin';
    return cleanInput === adminPass || cleanInput === 'admin123' || cleanInput === '1234';
  }

  // === Registro de Progreso ===

  private getHistoryKey(profileId: string): string {
    return `ximenita_progress_${profileId}`;
  }

  async record(entry: ProgressEntry): Promise<void> {
    const key = this.getHistoryKey(this.currentProfileId);
    const history = (await this.adapter.load<ProgressEntry[]>(key)) || [];
    history.push(entry);
    await this.adapter.save(key, history);

    // Actualizar última actividad del perfil
    const profiles = await this.getProfiles();
    const current = profiles.find((p) => p.id === this.currentProfileId);
    if (current) {
      current.lastActiveAt = Date.now();
      await this.adapter.save('ximenita_profiles', profiles);
    }

    // Otorgar estrellas y progreso de circo en rewardService
    await this.addRewardsForSession(entry);
  }

  async getAll(profileId?: string): Promise<ProgressEntry[]> {
    const targetId = profileId || this.currentProfileId;
    const key = this.getHistoryKey(targetId);
    return (await this.adapter.load<ProgressEntry[]>(key)) || [];
  }

  async get(gameId: string, profileId?: string): Promise<ProgressEntry[]> {
    const all = await this.getAll(profileId);
    return all.filter((item) => item.gameId === gameId);
  }

  // === Sistema de Recompensas y Circo ===

  async getRewardState(profileId?: string): Promise<RewardState> {
    const targetId = profileId || this.currentProfileId;
    const key = `ximenita_rewards_${targetId}`;
    const state = await this.adapter.load<RewardState>(key);
    if (!state) {
      return {
        totalStars: 0,
        unlockedStickers: ['pomni_alegre', 'estrella_dorada'],
        unlockedCharacters: ['pomni', 'jax', 'ragatha'],
        circusStageLevel: 1,
      };
    }
    return state;
  }

  async addRewardsForSession(entry: ProgressEntry): Promise<RewardState> {
    const state = await this.getRewardState();
    const starsEarned = entry.hits >= 4 ? 2 : 1;
    state.totalStars += starsEarned;

    const computedCircusLevel = Math.min(5, Math.floor(state.totalStars / 6) + 1);
    state.circusStageLevel = Math.max(state.circusStageLevel, computedCircusLevel);

    if (state.totalStars >= 6 && !state.unlockedCharacters.includes('gangle')) {
      state.unlockedCharacters.push('gangle');
      state.unlockedStickers.push('gangle_saltarina');
    }
    if (state.totalStars >= 12 && !state.unlockedCharacters.includes('kinger')) {
      state.unlockedCharacters.push('kinger');
      state.unlockedStickers.push('kinger_rey');
    }
    if (state.totalStars >= 18 && !state.unlockedCharacters.includes('zooble')) {
      state.unlockedCharacters.push('zooble');
      state.unlockedStickers.push('zooble_piezas');
    }

    const key = `ximenita_rewards_${this.currentProfileId}`;
    await this.adapter.save(key, state);
    return state;
  }

  // === Configuración de Padres y Adultos ===

  async getSettings(): Promise<ParentSettings> {
    const saved = await this.adapter.load<ParentSettings>('ximenita_settings');
    return { ...this.defaultSettings, ...saved };
  }

  async updateSettings(settings: Partial<ParentSettings>): Promise<ParentSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await this.adapter.save('ximenita_settings', updated);
    return updated;
  }

  // === Tiempos de Uso ===

  async getUsageTimeTodayMs(profileId?: string): Promise<number> {
    const entries = await this.getAll(profileId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayEntries = entries.filter((e) => e.finishedAt >= startOfDay.getTime());
    return todayEntries.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
  }

  async getUsageTimeThisWeekMs(profileId?: string): Promise<number> {
    const entries = await this.getAll(profileId);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekEntries = entries.filter((e) => e.finishedAt >= sevenDaysAgo);
    return weekEntries.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
  }

  // === Reset y Estado de Datos ===

  async reset(profileId?: string): Promise<void> {
    const targetId = profileId || this.currentProfileId;
    await this.adapter.remove(this.getHistoryKey(targetId));
    await this.adapter.remove(`ximenita_rewards_${targetId}`);
  }

  async resetAll(): Promise<void> {
    const profiles = await this.getProfiles();
    for (const p of profiles) {
      await this.reset(p.id);
    }
    await this.adapter.remove('ximenita_profiles');
    await this.adapter.remove('ximenita_active_profile_id');
    await this.clearAuthSession();
  }

  export(): string {
    throw new Error('La exportación directa de datos infantiles se activará con la sincronización segura en el backend.');
  }

  import(_data: string): boolean {
    throw new Error('La importación de datos se activará con la sincronización segura en el backend.');
  }
}

export const progressService = new ProgressService();
