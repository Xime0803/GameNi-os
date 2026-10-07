import { ParentSettings, ProgressEntry, RewardState, UserProfile } from './types';

export interface ProgressAdapter {
  load<T>(key: string): Promise<T | null>;
  save<T>(key: string, data: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export class LocalStorageAdapter implements ProgressAdapter {
  async load<T>(key: string): Promise<T | null> {
    try {
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
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error guardando clave ${key}:`, err);
    }
  }

  async remove(key: string): Promise<void> {
    try {
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
    adultPassword: '1234',
  };

  constructor(adapter?: ProgressAdapter) {
    this.adapter = adapter || new LocalStorageAdapter();
  }

  // === Perfiles de Usuario Anónimos ===

  async getProfiles(): Promise<UserProfile[]> {
    const list = await this.adapter.load<UserProfile[]>('ximenita_profiles');
    if (!list || list.length === 0) {
      const initialProfile: UserProfile = {
        id: 'perfil-1',
        name: 'Pequeño Artista',
        avatar: '🐒',
        ageGroup: 'inicial',
        createdAt: Date.now(),
      };
      await this.adapter.save('ximenita_profiles', [initialProfile]);
      return [initialProfile];
    }
    return list;
  }

  async getActiveProfile(): Promise<UserProfile> {
    const profiles = await this.getProfiles();
    const savedActiveId = await this.adapter.load<string>('ximenita_active_profile_id') || 'perfil-1';
    this.currentProfileId = savedActiveId;
    const found = profiles.find((p) => p.id === savedActiveId);
    return found || profiles[0];
  }

  async setActiveProfile(profileId: string): Promise<void> {
    this.currentProfileId = profileId;
    await this.adapter.save('ximenita_active_profile_id', profileId);
  }

  async createProfile(name: string, ageGroup: 'inicial' | 'avanzado', avatar: string = '🐰'): Promise<UserProfile> {
    const profiles = await this.getProfiles();
    const newId = `perfil-${Date.now().toString().slice(-4)}`;
    const newProfile: UserProfile = {
      id: newId,
      name: name.trim() || `Amiguito ${profiles.length + 1}`,
      avatar,
      ageGroup,
      createdAt: Date.now(),
    };
    profiles.push(newProfile);
    await this.adapter.save('ximenita_profiles', profiles);
    await this.setActiveProfile(newId);
    return newProfile;
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
    // 1 estrella base por completar, +1 si tuvo alta precisión
    const starsEarned = entry.hits >= 4 ? 2 : 1;
    state.totalStars += starsEarned;

    // Actualizar nivel del circo (1 a 5) cada 6 estrellas
    const computedCircusLevel = Math.min(5, Math.floor(state.totalStars / 6) + 1);
    state.circusStageLevel = Math.max(state.circusStageLevel, computedCircusLevel);

    // Desbloquear personajes o stickers si alcanza hitos
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
  }

  // Exportar e Importar (preparadas pero reservadas para backend seguro)
  export(): string {
    throw new Error('La exportación directa de datos infantiles se activará con la sincronización segura en el backend.');
  }

  import(_data: string): boolean {
    throw new Error('La importación de datos se activará con la sincronización segura en el backend.');
  }
}

export const progressService = new ProgressService();
