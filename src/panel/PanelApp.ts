import { ALL_GAMES } from '../games';
import { progressService } from '../core/progressService';
import { speechService } from '../core/speechService';
import { AuthSession, ParentSettings, ProgressEntry, UserProfile } from '../core/types';
import { ReportsService } from './reports';

export class PanelApp {
  private container: HTMLElement;
  private currentTab: string = 'overview';
  private session: AuthSession;
  private activeProfile: UserProfile | null = null;
  private profilesList: UserProfile[] = [];
  private progressEntries: ProgressEntry[] = [];
  private settings: ParentSettings | null = null;
  private isDarkMode: boolean = false;

  constructor(container: HTMLElement, session?: AuthSession) {
    this.container = container;
    this.session = session || { role: 'admin' };
  }

  public async init(session?: AuthSession): Promise<void> {
    if (session) {
      this.session = session;
    } else {
      const saved = await progressService.getAuthSession();
      if (saved) this.session = saved;
    }

    this.isDarkMode = localStorage.getItem('ximenita_dark_mode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    await this.refreshData();

    // Si es admin y no ha seleccionado pestaña, abrir accesos o resumen
    if (this.session.role === 'admin' && this.currentTab === 'overview') {
      this.currentTab = 'access';
    }

    this.render();
  }

  private async refreshData(): Promise<void> {
    this.profilesList = await progressService.getProfiles();

    if (this.session.role === 'parent' && this.session.profileId) {
      const found = this.profilesList.find((p) => p.id === this.session.profileId);
      this.activeProfile = found || this.profilesList[0];
      await progressService.setActiveProfile(this.activeProfile.id);
    } else {
      this.activeProfile = await progressService.getActiveProfile();
    }

    this.progressEntries = await progressService.getAll(this.activeProfile.id);
    this.settings = await progressService.getSettings();
  }

  private render(): void {
    if (!this.activeProfile || !this.settings) return;

    const isAdmin = this.session.role === 'admin';

    this.container.innerHTML = `
      <div class="panel-container">
        <!-- Encabezado Institucional del Panel -->
        <header class="panel-header">
          <div class="panel-title">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h1>Panel Pedagógico y de Gestión Educativa</h1>
              ${
                isAdmin
                  ? '<span class="role-badge role-badge-admin">👑 Administrador / Docente</span>'
                  : `<span class="role-badge role-badge-parent">👨‍👩‍👧 Familia de ${this.activeProfile.name}</span>`
              }
            </div>
            <p>Sistema de Monitoreo Curricular CNEB • El Mundo de Ximenita</p>
          </div>

          <div class="panel-header-controls">
            ${
              isAdmin
                ? `
                  <!-- Selector de Estudiante para Administradores -->
                  <div class="profile-selector-box" title="Cambiar estudiante activo">
                    <span>👤 Alumno:</span>
                    <select id="profile-select-dropdown" aria-label="Seleccionar estudiante">
                      ${this.profilesList
                        .map(
                          (p) =>
                            `<option value="${p.id}" ${p.id === this.activeProfile?.id ? 'selected' : ''}>
                              ${p.name} (Código: ${p.accessCode})
                            </option>`
                        )
                        .join('')}
                    </select>
                  </div>
                  <button id="quick-add-btn" class="btn-primary" style="padding: 7px 12px; font-size: 13px;" title="Registrar nuevo alumno">+ Nuevo Alumno</button>
                `
                : `
                  <!-- Badge del Código de Acceso del Estudiante -->
                  <div class="code-badge-pill" title="Código de acceso familiar activo">
                    <span>🔑 CÓDIGO:</span>
                    <span>${this.activeProfile.accessCode}</span>
                  </div>
                `
            }

            <!-- Alternador de Tema -->
            <button id="theme-toggle-btn" class="theme-toggle-btn" aria-label="Alternar modo visual">
              ${this.isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
            </button>

            <!-- Cerrar Sesión -->
            <button id="logout-btn" class="btn-logout" title="Cerrar sesión actual">
              🚪 Salir
            </button>

            <!-- Retorno al Circo Infantil -->
            <a href="./index.html" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
              🎪 Ir al Juego
            </a>
          </div>
        </header>

        <!-- Navegación por Pestañas Moderna (Sin barras de scroll toscas) -->
        <nav class="panel-nav" role="tablist">
          ${
            isAdmin
              ? `
                <button class="panel-nav-btn ${this.currentTab === 'access' ? 'active' : ''}" data-tab="access" role="tab">
                  🔑 Códigos y Accesos (${this.profilesList.length})
                </button>
              `
              : ''
          }
          <button class="panel-nav-btn ${this.currentTab === 'overview' ? 'active' : ''}" data-tab="overview" role="tab">
            📊 Resumen y Tiempos
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'cneb' ? 'active' : ''}" data-tab="cneb" role="tab">
            🎓 Competencias CNEB
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'games' ? 'active' : ''}" data-tab="games" role="tab">
            🎮 Detalle por Juego
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'recs' ? 'active' : ''}" data-tab="recs" role="tab">
            💡 Recomendaciones para Familias
          </button>
          ${
            isAdmin
              ? `
                <button class="panel-nav-btn ${this.currentTab === 'classroom' ? 'active' : ''}" data-tab="classroom" role="tab">
                  🏫 Modo Aula (Percentiles)
                </button>
              `
              : ''
          }
          <button class="panel-nav-btn ${this.currentTab === 'settings' ? 'active' : ''}" data-tab="settings" role="tab">
            ⚙️ Ajustes y Privacidad
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'about' ? 'active' : ''}" data-tab="about" role="tab">
            📜 Acerca de y Legal
          </button>
        </nav>

        <!-- Contenedor Dinámico de la Pestaña -->
        <main class="panel-tab-content">
          ${this.renderActiveTabContent()}
        </main>
      </div>

      <!-- Contenedor para Modales Dinámicos -->
      <div id="modal-container"></div>
    `;

    this.bindEvents();
  }

  private renderActiveTabContent(): string {
    switch (this.currentTab) {
      case 'access':
        return this.renderAccessManagementTab();
      case 'overview':
        return this.renderOverviewTab();
      case 'cneb':
        return this.renderCnebTab();
      case 'games':
        return this.renderGamesDetailTab();
      case 'recs':
        return this.renderRecommendationsTab();
      case 'classroom':
        return this.renderClassroomTab();
      case 'settings':
        return this.renderSettingsTab();
      case 'about':
        return this.renderAboutTab();
      default:
        return this.renderOverviewTab();
    }
  }

  // =========================================================================
  // 1. PESTAÑA: Gestión de Accesos con Códigos de 6 Dígitos (Modo Admin)
  // =========================================================================
  private renderAccessManagementTab(): string {
    return `
      <div class="panel-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary);">
              Gestión de Accesos de Estudiantes y Familias
            </h3>
            <p style="font-size: 13.5px; color: var(--panel-text-secondary); margin-top: 4px;">
              Cada estudiante cuenta con un <strong>código único de 6 dígitos</strong> para que sus padres o el menor ingresen sin cuentas ni correos.
            </p>
          </div>
          <button id="btn-create-student-modal" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <span>➕</span> <span>Registrar Estudiante y Generar Código</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="panel-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Código de 6 Dígitos</th>
                <th>Grado / Sección</th>
                <th>Apoderado</th>
                <th>Última Actividad</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.profilesList
                .map(
                  (p) => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 24px;">${p.avatar || '🐰'}</span>
                      <div>
                        <strong>${p.name}</strong>
                        <div style="font-size: 12px; color: var(--panel-text-muted);">${p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="code-badge-pill" style="font-size: 16px; color: var(--panel-primary);">
                        ${p.accessCode}
                      </span>
                      <button class="btn-icon-action btn-copy-code" data-code="${p.accessCode}" title="Copiar código">
                        📋 Copiar
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style="display: inline-block; padding: 4px 10px; background: var(--panel-surface-subtle); border-radius: 6px; font-size: 12.5px; font-weight: 600;">
                      ${p.grade || (p.ageGroup === 'inicial' ? 'Inicial (3-6)' : 'Primaria (7-10)')}
                    </span>
                  </td>
                  <td>${p.parentName || 'Familia'}</td>
                  <td>
                    <span style="font-size: 13px; color: var(--panel-text-secondary);">
                      ${p.lastActiveAt ? new Date(p.lastActiveAt).toLocaleDateString() : 'Pendiente'}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button class="btn-icon-action btn-print-pass" data-profile-id="${p.id}" title="Generar pase de acceso para entregar a la familia">
                        🎫 Pase Familiar
                      </button>
                      <button class="btn-icon-action btn-regen-code" data-profile-id="${p.id}" title="Generar nuevo código de 6 dígitos">
                        🔄 Nuevo Código
                      </button>
                      ${
                        this.profilesList.length > 1
                          ? `
                            <button class="btn-icon-action btn-delete-student" data-profile-id="${p.id}" style="color: var(--panel-danger);" title="Eliminar registro">
                              🗑️
                            </button>
                          `
                          : ''
                      }
                    </div>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 2. PESTAÑA: Resumen y Tiempos de Uso
  // =========================================================================
  private renderOverviewTab(): string {
    const totalTimeMs = this.progressEntries.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
    const totalMinutes = Math.round(totalTimeMs / 60000);
    const totalHits = this.progressEntries.reduce((acc, curr) => acc + curr.hits, 0);
    const totalMisses = this.progressEntries.reduce((acc, curr) => acc + curr.misses, 0);
    const totalAttempts = totalHits + totalMisses;
    const accuracy = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 0;

    return `
      <div class="metric-grid">
        <div class="metric-card accent-blue">
          <div class="metric-header">
            <span class="metric-label">Tiempo Total Registrado</span>
            <span class="metric-icon-badge">⏱️</span>
          </div>
          <div class="metric-value">${totalMinutes} min</div>
          <div class="metric-subtext">Historial acumulado en el dispositivo</div>
        </div>

        <div class="metric-card accent-purple">
          <div class="metric-header">
            <span class="metric-label">Actividades Completadas</span>
            <span class="metric-icon-badge">🎯</span>
          </div>
          <div class="metric-value">${this.progressEntries.length}</div>
          <div class="metric-subtext">Rondas pedagógicas finalizadas</div>
        </div>

        <div class="metric-card accent-green">
          <div class="metric-header">
            <span class="metric-label">Precisión Formativa</span>
            <span class="metric-icon-badge">📈</span>
          </div>
          <div class="metric-value" style="color: var(--panel-success);">${accuracy}%</div>
          <div class="metric-subtext">${accuracy >= 75 ? 'Desempeño destacado' : 'En proceso de consolidación'}</div>
        </div>

        <div class="metric-card accent-amber">
          <div class="metric-header">
            <span class="metric-label">Límite Diario Asignado</span>
            <span class="metric-icon-badge">⏳</span>
          </div>
          <div class="metric-value">${this.settings?.dailyTimeLimitMinutes || 20} min</div>
          <div class="metric-subtext">Protección de bienestar digital infantil</div>
        </div>
      </div>

      <div class="panel-card">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--panel-text-primary); margin-bottom: 6px;">
          Pauta de Bienestar Digital y Ergonomía Visual
        </h3>
        <p style="color: var(--panel-text-secondary); font-size: 14px; line-height: 1.6;">
          De acuerdo a la Organización Mundial de la Salud (OMS) y el Ministerio de Educación del Perú (MINEDU), se sugiere que los niños de ciclo inicial no superen los 20-30 minutos diarios frente a pantallas, balanceando con actividades al aire libre, juego corporal y trazado tangible con masa o plastilina.
        </p>
      </div>
    `;
  }

  // =========================================================================
  // 3. PESTAÑA: Competencias CNEB Perú
  // =========================================================================
  private renderCnebTab(): string {
    const reports = ReportsService.calculateCNEBReports(this.progressEntries);

    return `
      <div class="panel-card">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary);">
          Evaluación Formativa según Currículo Nacional (CNEB)
        </h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 22px; font-size: 13.5px;">
          Nivel de logro cualitativo oficial para <strong>${this.activeProfile?.name}</strong>:
        </p>

        ${Object.values(reports)
          .map(
            (rep) => `
            <div class="competency-card">
              <div class="competency-header">
                <div>
                  <div class="competency-title">${rep.competency}</div>
                  <div class="competency-cycle">${rep.cnebCycle} • ${rep.totalActivities} actividades completadas</div>
                </div>
                <span class="cneb-badge badge-${rep.level.toLowerCase()}">
                  ${rep.level} - ${rep.levelDescription}
                </span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${rep.masteryPercentage}%; background: ${this.getColorForLevel(rep.level)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--panel-text-muted);">
                <span>Precisión: ${rep.accuracy}%</span>
                <span>Nivel de Dominio: ${rep.masteryPercentage}%</span>
              </div>
            </div>
          `
          )
          .join('')}
      </div>
    `;
  }

  private getColorForLevel(level: string): string {
    switch (level) {
      case 'AD': return 'var(--panel-success)';
      case 'A': return 'var(--panel-primary)';
      case 'B': return 'var(--panel-warning)';
      default: return 'var(--panel-text-muted)';
    }
  }

  // =========================================================================
  // 4. PESTAÑA: Detalle por Juego
  // =========================================================================
  private renderGamesDetailTab(): string {
    return `
      <div class="panel-card">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary);">
          Desempeño en los 10 Mini-Juegos Circenses
        </h3>
        <div class="table-responsive" style="margin-top: 16px;">
          <table class="panel-table">
            <thead>
              <tr>
                <th>Mini-Juego</th>
                <th>Área CNEB</th>
                <th>Nivel</th>
                <th>Aciertos</th>
                <th>Intentos</th>
                <th>Precisión</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              ${ALL_GAMES.map((game) => {
                const gameEntries = this.progressEntries.filter((e) => e.gameId === game.config.id);
                const maxLevel = gameEntries.reduce((acc, curr) => Math.max(acc, curr.level), 1);
                const hits = gameEntries.reduce((acc, curr) => acc + curr.hits, 0);
                const misses = gameEntries.reduce((acc, curr) => acc + curr.misses, 0);
                const total = hits + misses;
                const acc = total > 0 ? Math.round((hits / total) * 100) : 0;
                const timeMs = gameEntries.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
                const timeMin = Math.round(timeMs / 60000);

                return `
                  <tr>
                    <td><strong>${game.config.title}</strong></td>
                    <td>${game.config.area}</td>
                    <td>${gameEntries.length > 0 ? `Nivel ${maxLevel}/5` : '-'}</td>
                    <td>${hits}</td>
                    <td>${total}</td>
                    <td>${total > 0 ? `${acc}%` : 'Sin jugar'}</td>
                    <td>${timeMin} min</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 5. PESTAÑA: Recomendaciones Formativas
  // =========================================================================
  private renderRecommendationsTab(): string {
    const recs = ReportsService.generatePedagogicalRecommendations(this.progressEntries);

    return `
      <div class="panel-card">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary);">
          Orientaciones Formativas para Familias y Docentes
        </h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 13.5px;">
          Sugerencias pedagógicas generadas a partir de los patrones de acierto y trazado de <strong>${this.activeProfile?.name}</strong>:
        </p>

        ${recs
          .map(
            (r) => `
            <div class="rec-card priority-${r.priority}">
              <div class="rec-title">${r.title} (${r.area})</div>
              <div class="rec-item"><strong>Diagnóstico formativo:</strong> ${r.observation}</div>
              <div class="rec-item"><strong>Pauta práctica en el hogar:</strong> ${r.homeActivity}</div>
              <div class="rec-item"><strong>Recomendación para el aula:</strong> ${r.classroomTip}</div>
            </div>
          `
          )
          .join('')}
      </div>
    `;
  }

  // =========================================================================
  // 6. PESTAÑA: Modo Aula (Docentes - Percentiles)
  // =========================================================================
  private renderClassroomTab(): string {
    const cohort = ReportsService.calculateClassroomMetrics(this.progressEntries, this.profilesList.length);

    return `
      <div class="panel-card">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary);">
          Métricas de Cohorte y Distribución Anónima de la Clase
        </h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 22px; font-size: 13.5px;">
          Vista estadística para docentes sin nombres ni rankings competitivos (garantía de privacidad según Ley 29733):
        </p>

        <div class="cohort-grid">
          <div class="cohort-stat-box">
            <div class="cohort-stat-num">${cohort.percentile25}%</div>
            <div class="cohort-stat-label">Percentil 25 (P25)</div>
          </div>
          <div class="cohort-stat-box">
            <div class="cohort-stat-num" style="color: var(--panel-success);">${cohort.medianMastery}%</div>
            <div class="cohort-stat-label">Mediana del Grupo (P50)</div>
          </div>
          <div class="cohort-stat-box">
            <div class="cohort-stat-num" style="color: var(--panel-primary);">${cohort.percentile75}%</div>
            <div class="cohort-stat-label">Percentil 75 (P75)</div>
          </div>
        </div>

        <h4 style="margin-top: 24px; margin-bottom: 12px; font-size: 15px;">Distribución Cualitativa de la Clase:</h4>
        <div style="display: flex; gap: 8px; height: 28px; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
          <div style="width: ${cohort.distribution.inicio}%; background: var(--panel-text-muted);" title="En Inicio: ${cohort.distribution.inicio}%"></div>
          <div style="width: ${cohort.distribution.proceso}%; background: var(--panel-warning);" title="En Proceso: ${cohort.distribution.proceso}%"></div>
          <div style="width: ${cohort.distribution.logrado}%; background: var(--panel-primary);" title="Logrado: ${cohort.distribution.logrado}%"></div>
          <div style="width: ${cohort.distribution.destacado}%; background: var(--panel-success);" title="Destacado: ${cohort.distribution.destacado}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--panel-text-secondary);">
          <span>En Inicio: ${cohort.distribution.inicio}%</span>
          <span>En Proceso: ${cohort.distribution.proceso}%</span>
          <span>Logro Esperado: ${cohort.distribution.logrado}%</span>
          <span>Destacado: ${cohort.distribution.destacado}%</span>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 7. PESTAÑA: Ajustes y Privacidad
  // =========================================================================
  private renderSettingsTab(): string {
    const isAdmin = this.session.role === 'admin';

    return `
      <div class="panel-card">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary);">
          Parámetros del Sistema y Bienestar
        </h3>

        <div style="display: flex; flex-direction: column; gap: 20px; max-width: 650px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--panel-border);">
            <div>
              <h4 style="font-size: 15px; font-weight: 600;">Velocidad de locución de Ximenita</h4>
              <p style="font-size: 13px; color: var(--panel-text-muted);">Español peruano cálido para atención infantil</p>
            </div>
            <select id="voice-speed-select" class="form-control" style="width: 160px;">
              <option value="normal" ${this.settings?.voiceSpeed === 'normal' ? 'selected' : ''}>Normal (0.85)</option>
              <option value="lenta" ${this.settings?.voiceSpeed === 'lenta' ? 'selected' : ''}>Lenta (0.70)</option>
              <option value="muy_lenta" ${this.settings?.voiceSpeed === 'muy_lenta' ? 'selected' : ''}>Muy lenta (0.55)</option>
            </select>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--panel-border);">
            <div>
              <h4 style="font-size: 15px; font-weight: 600;">Límite de tiempo diario</h4>
              <p style="font-size: 13px; color: var(--panel-text-muted);">Avisa cariñosamente cuando se cumple el tiempo</p>
            </div>
            <select id="time-limit-select" class="form-control" style="width: 160px;">
              <option value="10" ${this.settings?.dailyTimeLimitMinutes === 10 ? 'selected' : ''}>10 minutos</option>
              <option value="20" ${this.settings?.dailyTimeLimitMinutes === 20 ? 'selected' : ''}>20 minutos</option>
              <option value="30" ${this.settings?.dailyTimeLimitMinutes === 30 ? 'selected' : ''}>30 minutos</option>
              <option value="45" ${this.settings?.dailyTimeLimitMinutes === 45 ? 'selected' : ''}>45 minutos</option>
              <option value="0" ${this.settings?.dailyTimeLimitMinutes === 0 ? 'selected' : ''}>Sin límite</option>
            </select>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--panel-border);">
            <div>
              <h4 style="font-size: 15px; font-weight: 600;">Música de fondo circense</h4>
              <p style="font-size: 13px; color: var(--panel-text-muted);">Melodía suave sintetizada en tiempo real</p>
            </div>
            <input type="checkbox" id="music-toggle-check" ${this.settings?.musicEnabled ? 'checked' : ''} style="width: 22px; height: 22px;" />
          </div>

          ${
            isAdmin
              ? `
                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--panel-border);">
                  <div>
                    <h4 style="font-size: 15px; font-weight: 600;">Contraseña de Administrador</h4>
                    <p style="font-size: 13px; color: var(--panel-text-muted);">Actualizar clave maestra institucional</p>
                  </div>
                  <button id="btn-change-pass" class="btn-secondary" style="font-size: 13px;">Cambiar Clave</button>
                </div>
              `
              : ''
          }

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px;">
            <div>
              <h4 style="font-size: 15px; font-weight: 600; color: var(--panel-danger);">Reiniciar progreso del estudiante</h4>
              <p style="font-size: 13px; color: var(--panel-text-muted);">Borra estrellas y rondas del perfil actual</p>
            </div>
            <button id="reset-profile-btn" class="btn-danger">Reiniciar Datos</button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 8. PESTAÑA: Acerca de y Marco Legal
  // =========================================================================
  private renderAboutTab(): string {
    return `
      <div class="panel-card" style="line-height: 1.7; font-size: 14px; color: var(--panel-text-secondary);">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary); margin-bottom: 10px;">
          Privacidad y Cumplimiento Normativo
        </h3>
        <p>
          <strong>El Mundo de Ximenita</strong> aplica la arquitectura de <em>Privacidad por Diseño</em> (Privacy by Design), garantizando el cumplimiento irrestricto de:
        </p>
        <ul style="margin: 12px 0 16px 20px;">
          <li><strong>Ley Peruana N° 29733 (Protección de Datos Personales):</strong> Cero almacenamiento de datos personales identificables (PII). El sistema opera exclusivamente con perfiles anónimos y códigos de acceso locales de 6 dígitos.</li>
          <li><strong>COPPA & GDPR-K:</strong> Sin publicidad comercial, sin cookies de rastreo de terceros y sin comercialización de información escolar.</li>
        </ul>

        <h3 style="font-size: 18px; font-weight: 700; color: var(--panel-text-primary); margin-top: 24px; margin-bottom: 10px;">
          Fundamentación Curricular CNEB
        </h3>
        <p>
          Las competencias evaluadas corresponden al Currículo Nacional de la Educación Básica (CNEB) del Perú, articulando resolución de problemas de cantidad y forma en Matemática, indagación científica en Ciencia y Tecnología, y discriminación fonológica y grafomotricidad en Comunicación.
        </p>
      </div>
    `;
  }

  // =========================================================================
  // Manejo de Eventos y Modales
  // =========================================================================
  private bindEvents(): void {
    // Cambio de Pestañas
    const tabs = this.container.querySelectorAll('.panel-nav-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        if (tabId) {
          this.currentTab = tabId;
          this.render();
        }
      });
    });

    // Cambio de Estudiante (Admin)
    const profileDropdown = this.container.querySelector('#profile-select-dropdown') as HTMLSelectElement;
    profileDropdown?.addEventListener('change', async (e) => {
      const selectedId = (e.target as HTMLSelectElement).value;
      await progressService.setActiveProfile(selectedId);
      await this.refreshData();
      this.render();
    });

    // Botón Rápido + Nuevo Alumno
    this.container.querySelector('#quick-add-btn')?.addEventListener('click', () => {
      this.openCreateStudentModal();
    });

    this.container.querySelector('#btn-create-student-modal')?.addEventListener('click', () => {
      this.openCreateStudentModal();
    });

    // Modo Oscuro
    this.container.querySelector('#theme-toggle-btn')?.addEventListener('click', () => {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      localStorage.setItem('ximenita_dark_mode', this.isDarkMode ? 'true' : 'false');
      this.render();
    });

    // Cerrar Sesión
    this.container.querySelector('#logout-btn')?.addEventListener('click', async () => {
      await progressService.clearAuthSession();
      window.location.reload();
    });

    // Copiar Códigos de 6 Dígitos
    this.container.querySelectorAll('.btn-copy-code').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        if (code) {
          navigator.clipboard.writeText(code);
          btn.textContent = '✅ ¡Copiado!';
          setTimeout(() => (btn.textContent = '📋 Copiar'), 2000);
        }
      });
    });

    // Generar Pase Familiar Imprimible
    this.container.querySelectorAll('.btn-print-pass').forEach((btn) => {
      btn.addEventListener('click', () => {
        const profileId = btn.getAttribute('data-profile-id');
        if (profileId) {
          const profile = this.profilesList.find((p) => p.id === profileId);
          if (profile) this.openFamilyPassModal(profile);
        }
      });
    });

    // Regenerar Código
    this.container.querySelectorAll('.btn-regen-code').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const profileId = btn.getAttribute('data-profile-id');
        if (profileId && confirm('¿Desea generar un nuevo código único de 6 dígitos para este estudiante?')) {
          await progressService.regenerateCode(profileId);
          await this.refreshData();
          this.render();
        }
      });
    });

    // Eliminar Estudiante
    this.container.querySelectorAll('.btn-delete-student').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const profileId = btn.getAttribute('data-profile-id');
        if (profileId && confirm('¿Está seguro de eliminar este estudiante? Esta acción borrará su progreso.')) {
          await progressService.deleteProfile(profileId);
          await this.refreshData();
          this.render();
        }
      });
    });

    // Ajustes: Velocidad de Voz
    const voiceSelect = this.container.querySelector('#voice-speed-select') as HTMLSelectElement;
    voiceSelect?.addEventListener('change', async () => {
      const spd = voiceSelect.value as any;
      speechService.setSpeed(spd);
      await progressService.updateSettings({ voiceSpeed: spd });
    });

    // Ajustes: Límite Diario
    const timeSelect = this.container.querySelector('#time-limit-select') as HTMLSelectElement;
    timeSelect?.addEventListener('change', async () => {
      const mins = parseInt(timeSelect.value, 10);
      await progressService.updateSettings({ dailyTimeLimitMinutes: mins });
    });

    // Ajustes: Música
    const musicCheck = this.container.querySelector('#music-toggle-check') as HTMLInputElement;
    musicCheck?.addEventListener('change', async () => {
      await progressService.updateSettings({ musicEnabled: musicCheck.checked });
    });

    // Ajustes: Reiniciar Perfil
    this.container.querySelector('#reset-profile-btn')?.addEventListener('click', async () => {
      if (confirm('¿Confirmar reinicio de datos para el estudiante seleccionado?')) {
        await progressService.reset(this.activeProfile?.id);
        await this.refreshData();
        this.render();
        alert('Progreso reiniciado correctamente.');
      }
    });
  }

  // Modal: Registrar Nuevo Estudiante
  private openCreateStudentModal(): void {
    const modalHost = this.container.querySelector('#modal-container') as HTMLElement;
    if (!modalHost) return;

    modalHost.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Registrar Estudiante y Generar Código</h3>
          <p class="modal-desc">El sistema generará automáticamente un código único de 6 dígitos para el acceso familiar.</p>

          <form id="create-student-form">
            <div class="form-group">
              <label for="new-student-name">Nombre o Apodo del Niño/a:</label>
              <input type="text" id="new-student-name" class="form-control" placeholder="Ej: Valentina" required />
            </div>

            <div class="form-group">
              <label for="new-student-grade">Grado / Aula:</label>
              <input type="text" id="new-student-grade" class="form-control" placeholder="Ej: Inicial 4 años - Sección A" />
            </div>

            <div class="form-group">
              <label for="new-student-agegroup">Ciclo Pedagógico CNEB:</label>
              <select id="new-student-agegroup" class="form-control">
                <option value="inicial">Ciclo II Inicial (3 a 6 años)</option>
                <option value="avanzado">Ciclos III/IV Primaria (7 a 10 años)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="new-student-parent">Familia o Apoderado (Opcional):</label>
              <input type="text" id="new-student-parent" class="form-control" placeholder="Ej: Familia Morales" />
            </div>

            <div class="modal-actions">
              <button type="button" id="btn-cancel-modal" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary">Generar Código y Guardar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    modalHost.querySelector('#btn-cancel-modal')?.addEventListener('click', () => {
      modalHost.innerHTML = '';
    });

    const form = modalHost.querySelector('#create-student-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (modalHost.querySelector('#new-student-name') as HTMLInputElement).value;
      const grade = (modalHost.querySelector('#new-student-grade') as HTMLInputElement).value;
      const ageGroup = (modalHost.querySelector('#new-student-agegroup') as HTMLSelectElement).value as any;
      const parentName = (modalHost.querySelector('#new-student-parent') as HTMLInputElement).value;

      const avatars = ['🐒', '🐰', '🦁', '🐸', '🐘', '🐝', '🦜', '🐢'];
      const avatar = avatars[Math.floor(Math.random() * avatars.length)];

      const created = await progressService.createProfile(name, ageGroup, avatar, grade, parentName);
      modalHost.innerHTML = '';
      await this.refreshData();
      this.render();

      // Abrir inmediatamente la ficha de entrega para la familia
      this.openFamilyPassModal(created);
    });
  }

  // Modal: Pase de Acceso Familiar Imprimible
  private openFamilyPassModal(student: UserProfile): void {
    const modalHost = this.container.querySelector('#modal-container') as HTMLElement;
    if (!modalHost) return;

    modalHost.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="max-width: 540px; text-align: center;">
          <h3 class="modal-title">🎫 Pase de Acceso para Familias</h3>
          <p class="modal-desc">Entregue esta información a los padres o tutores del estudiante.</p>

          <div class="family-pass-card">
            <div style="font-size: 28px; margin-bottom: 6px;">🎪 El Mundo de Ximenita</div>
            <div style="font-size: 16px; font-weight: 700; color: #1E293B;">
              Estudiante: ${student.avatar} ${student.name}
            </div>
            <div style="font-size: 13px; color: #64748B; margin-top: 2px;">
              ${student.grade || 'Nivel Educativo'}
            </div>

            <div class="pass-code-display">${student.accessCode}</div>

            <div style="font-size: 13.5px; color: #475569; line-height: 1.5; margin-top: 10px;">
              <strong>Instrucciones para Familias:</strong><br />
              1. Ingrese a la plataforma desde su tablet o computadora.<br />
              2. Seleccione <em>"Acceso Familias (Código 6 Dígitos)"</em>.<br />
              3. Digite el código <strong>${student.accessCode}</strong> para ver el progreso pedagógico CNEB y recomendaciones formativas.
            </div>
          </div>

          <div class="modal-actions" style="justify-content: center;">
            <button id="btn-close-pass" class="btn-secondary">Cerrar</button>
            <button id="btn-print-action" class="btn-primary">🖨️ Imprimir / Guardar</button>
          </div>
        </div>
      </div>
    `;

    modalHost.querySelector('#btn-close-pass')?.addEventListener('click', () => {
      modalHost.innerHTML = '';
    });

    modalHost.querySelector('#btn-print-action')?.addEventListener('click', () => {
      window.print();
    });
  }
}
