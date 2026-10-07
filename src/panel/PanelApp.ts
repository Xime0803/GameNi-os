import { ALL_GAMES } from '../games';
import { progressService } from '../core/progressService';
import { speechService } from '../core/speechService';
import { ParentSettings, ProgressEntry, UserProfile } from '../core/types';
import { ReportsService } from './reports';

export class PanelApp {
  private container: HTMLElement;
  private currentTab: string = 'overview';
  private activeProfile: UserProfile | null = null;
  private profilesList: UserProfile[] = [];
  private progressEntries: ProgressEntry[] = [];
  private settings: ParentSettings | null = null;
  private isDarkMode: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public async init(): Promise<void> {
    this.isDarkMode = localStorage.getItem('ximenita_dark_mode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    await this.refreshData();
    this.render();
  }

  private async refreshData(): Promise<void> {
    this.profilesList = await progressService.getProfiles();
    this.activeProfile = await progressService.getActiveProfile();
    this.progressEntries = await progressService.getAll(this.activeProfile.id);
    this.settings = await progressService.getSettings();
  }

  private render(): void {
    if (!this.activeProfile || !this.settings) return;

    this.container.innerHTML = `
      <div class="panel-container">
        <!-- Encabezado del Panel Adulto -->
        <header class="panel-header">
          <div class="panel-title">
            <h1>Panel Pedagógico para Familias y Docentes</h1>
            <p>Monitoreo formativo alineado al Currículo Nacional de la Educación Básica (CNEB)</p>
          </div>

          <div class="panel-header-controls">
            <!-- Selector de Perfil -->
            <div class="profile-selector-box" title="Seleccionar perfil del estudiante">
              <span>👤 Perfil:</span>
              <select id="profile-select-dropdown" aria-label="Seleccionar perfil de estudiante">
                ${this.profilesList
                  .map(
                    (p) =>
                      `<option value="${p.id}" ${p.id === this.activeProfile?.id ? 'selected' : ''}>
                        ${p.name} (${p.ageGroup === 'inicial' ? '3-6 años' : '7-10 años'})
                      </option>`
                  )
                  .join('')}
              </select>
            </div>

            <button id="add-profile-btn" class="theme-toggle-btn" title="Crear nuevo perfil">+ Nuevo</button>

            <!-- Modo Oscuro -->
            <button id="theme-toggle-btn" class="theme-toggle-btn" aria-label="Alternar modo oscuro">
              ${this.isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
            </button>

            <!-- Enlace al Juego -->
            <a href="./index.html" class="gate-btn gate-btn-primary" style="text-decoration: none;">🎪 Volver al Circo</a>
          </div>
        </header>

        <!-- Navegación por Pestañas -->
        <nav class="panel-nav" role="tablist">
          <button class="panel-nav-btn ${this.currentTab === 'overview' ? 'active' : ''}" data-tab="overview" role="tab">
            📊 Resumen y Tiempo
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'cneb' ? 'active' : ''}" data-tab="cneb" role="tab">
            🎓 Competencias CNEB
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'games' ? 'active' : ''}" data-tab="games" role="tab">
            🎮 Detalle por Juego
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'recs' ? 'active' : ''}" data-tab="recs" role="tab">
            💡 Recomendaciones Pedagógicas
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'classroom' ? 'active' : ''}" data-tab="classroom" role="tab">
            🏫 Modo Aula (Docentes)
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'settings' ? 'active' : ''}" data-tab="settings" role="tab">
            ⚙️ Ajustes y Privacidad
          </button>
          <button class="panel-nav-btn ${this.currentTab === 'about' ? 'active' : ''}" data-tab="about" role="tab">
            📜 Acerca de y Legal
          </button>
        </nav>

        <!-- Contenido de la Pestaña Activa -->
        <main class="panel-tab-content">
          ${this.renderActiveTabContent()}
        </main>
      </div>
    `;

    this.bindEvents();
  }

  private renderActiveTabContent(): string {
    switch (this.currentTab) {
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
        return '<p>Pestaña no encontrada.</p>';
    }
  }

  // 1. Resumen y Tiempos de Uso
  private renderOverviewTab(): string {
    const totalTimeMs = this.progressEntries.reduce((acc, curr) => acc + (curr.timeMs || 0), 0);
    const totalMinutes = Math.round(totalTimeMs / 60000);
    const totalHits = this.progressEntries.reduce((acc, curr) => acc + curr.hits, 0);
    const totalMisses = this.progressEntries.reduce((acc, curr) => acc + curr.misses, 0);
    const totalAttempts = totalHits + totalMisses;
    const accuracy = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 0;

    return `
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Tiempo Total de Juego</div>
          <div class="metric-value">${totalMinutes} min</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Actividades Completadas</div>
          <div class="metric-value">${this.progressEntries.length}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Precisión Promedio</div>
          <div class="metric-value" style="color: #16A34A;">${accuracy}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Límite Diario Asignado</div>
          <div class="metric-value">${this.settings?.dailyTimeLimitMinutes || 20} min</div>
        </div>
      </div>

      <div class="panel-card">
        <h3>Hábitos de Uso y Bienestar Digital</h3>
        <p style="color: var(--panel-text-secondary); margin-top: 6px; font-size: 14px;">
          Se recomienda que las sesiones de juego no superen los 20-30 minutos continuos para cuidar la agudeza visual y promover la motricidad gruesa al aire libre.
        </p>
      </div>
    `;
  }

  // 2. Competencias CNEB Perú
  private renderCnebTab(): string {
    const reports = ReportsService.calculateCNEBReports(this.progressEntries);

    return `
      <div class="panel-card">
        <h3>Evaluación Formativa según Currículo Nacional (CNEB)</h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 14px;">
          Nivel de logro adaptativo evaluado en los ciclos II (Inicial) y III/IV (Primaria):
        </p>

        ${Object.values(reports)
          .map(
            (rep) => `
            <div class="competency-card">
              <div class="competency-header">
                <div>
                  <div class="competency-title">${rep.competency}</div>
                  <div class="competency-cycle">${rep.cnebCycle} • ${rep.totalActivities} actividades realizadas</div>
                </div>
                <span class="cneb-badge badge-${rep.level.toLowerCase()}">
                  ${rep.level} - ${rep.levelDescription}
                </span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${rep.masteryPercentage}%; background: ${this.getColorForLevel(rep.level)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--panel-text-muted);">
                <span>Precisión: ${rep.accuracy}%</span>
                <span>Dominio pedagógico: ${rep.masteryPercentage}%</span>
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
      case 'AD': return '#16A34A';
      case 'A': return '#2563EB';
      case 'B': return '#D97706';
      default: return '#94A3B8';
    }
  }

  // 3. Detalle por Juego
  private renderGamesDetailTab(): string {
    return `
      <div class="panel-card">
        <h3>Desempeño Individualizado en los 10 Mini-Juegos</h3>
        <div class="table-responsive" style="margin-top: 16px;">
          <table class="panel-table">
            <thead>
              <tr>
                <th>Juego</th>
                <th>Área CNEB</th>
                <th>Nivel Máx.</th>
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
                    <td>${gameEntries.length > 0 ? `Nivel ${maxLevel}` : '-'}</td>
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

  // 4. Recomendaciones Pedagógicas
  private renderRecommendationsTab(): string {
    const recs = ReportsService.generatePedagogicalRecommendations(this.progressEntries);

    return `
      <div class="panel-card">
        <h3>Orientaciones Formativas para Familias y Docentes</h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 14px;">
          Sugerencias automáticas basadas en los patrones de respuesta y trazado del estudiante:
        </p>

        ${recs
          .map(
            (r) => `
            <div class="rec-card priority-${r.priority}">
              <div class="rec-title">${r.title} (${r.area})</div>
              <div class="rec-item"><strong>Observación:</strong> ${r.observation}</div>
              <div class="rec-item"><strong>Actividad recomendada en el hogar:</strong> ${r.homeActivity}</div>
              <div class="rec-item"><strong>Pauta pedagógica en el aula:</strong> ${r.classroomTip}</div>
            </div>
          `
          )
          .join('')}
      </div>
    `;
  }

  // 5. Modo Aula (Docentes)
  private renderClassroomTab(): string {
    const cohort = ReportsService.calculateClassroomMetrics(this.progressEntries);

    return `
      <div class="panel-card">
        <h3>Visión Docente de Cohorte (Modo Aula Anónimo)</h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 14px;">
          Distribución estadística de percentiles sin individualización de nombres ni rankings competitivos (garantía de privacidad según Ley 29733):
        </p>

        <div class="cohort-grid">
          <div class="cohort-stat-box">
            <div class="cohort-stat-num">${cohort.percentile25}%</div>
            <div class="cohort-stat-label">Percentil 25 (P25)</div>
          </div>
          <div class="cohort-stat-box">
            <div class="cohort-stat-num" style="color: #16A34A;">${cohort.medianMastery}%</div>
            <div class="cohort-stat-label">Mediana del Grupo (P50)</div>
          </div>
          <div class="cohort-stat-box">
            <div class="cohort-stat-num" style="color: #2563EB;">${cohort.percentile75}%</div>
            <div class="cohort-stat-label">Percentil 75 (P75)</div>
          </div>
        </div>

        <h4 style="margin-top: 24px; margin-bottom: 12px;">Distribución Cualitativa de la Clase:</h4>
        <div style="display: flex; gap: 8px; height: 32px; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
          <div style="width: ${cohort.distribution.inicio}%; background: #94A3B8;" title="En Inicio: ${cohort.distribution.inicio}%"></div>
          <div style="width: ${cohort.distribution.proceso}%; background: #D97706;" title="En Proceso: ${cohort.distribution.proceso}%"></div>
          <div style="width: ${cohort.distribution.logrado}%; background: #2563EB;" title="Logrado: ${cohort.distribution.logrado}%"></div>
          <div style="width: ${cohort.distribution.destacado}%; background: #16A34A;" title="Destacado: ${cohort.distribution.destacado}%"></div>
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

  // 6. Ajustes y Privacidad
  private renderSettingsTab(): string {
    return `
      <div class="panel-card">
        <h3>Configuración de la Experiencia Infantil</h3>

        <div class="settings-group" style="margin-top: 16px;">
          <div class="settings-field">
            <div class="settings-label">
              <h4>Velocidad de voz de Ximenita</h4>
              <p>Español peruano (es-PE) pausado y adaptado para atención infantil</p>
            </div>
            <div class="settings-control">
              <select id="voice-speed-select" aria-label="Velocidad de voz">
                <option value="normal" ${this.settings?.voiceSpeed === 'normal' ? 'selected' : ''}>Normal (0.85)</option>
                <option value="lenta" ${this.settings?.voiceSpeed === 'lenta' ? 'selected' : ''}>Lenta (0.70)</option>
                <option value="muy_lenta" ${this.settings?.voiceSpeed === 'muy_lenta' ? 'selected' : ''}>Muy lenta (0.55)</option>
              </select>
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4>Límite de tiempo diario</h4>
              <p>Avisa al niño de forma cariñosa cuando se cumple el tiempo</p>
            </div>
            <div class="settings-control">
              <select id="time-limit-select" aria-label="Límite de tiempo diario">
                <option value="10" ${this.settings?.dailyTimeLimitMinutes === 10 ? 'selected' : ''}>10 minutos</option>
                <option value="20" ${this.settings?.dailyTimeLimitMinutes === 20 ? 'selected' : ''}>20 minutos (Recomendado)</option>
                <option value="30" ${this.settings?.dailyTimeLimitMinutes === 30 ? 'selected' : ''}>30 minutos</option>
                <option value="45" ${this.settings?.dailyTimeLimitMinutes === 45 ? 'selected' : ''}>45 minutos</option>
                <option value="0" ${this.settings?.dailyTimeLimitMinutes === 0 ? 'selected' : ''}>Sin límite</option>
              </select>
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4>Música ambiental circense</h4>
              <p>Síntesis armónica de fondo suave (desactivada por defecto)</p>
            </div>
            <div class="settings-control">
              <input type="checkbox" id="music-toggle-check" ${this.settings?.musicEnabled ? 'checked' : ''} style="width: 20px; height: 20px;" />
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4>Sincronización en la nube (Backend)</h4>
              <p>Exportación e importación de perfiles</p>
            </div>
            <div class="settings-control">
              <span style="font-size: 13px; color: var(--panel-text-muted);">Próximamente con backend seguro (Supabase/Firebase)</span>
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4 style="color: var(--panel-danger);">Reiniciar progreso del perfil actual</h4>
              <p>Elimina las estrellas y registros de este perfil de forma irreversible</p>
            </div>
            <div class="settings-control">
              <button id="reset-profile-btn" class="btn-danger">Reiniciar Datos</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 7. Acerca de y Legal
  private renderAboutTab(): string {
    return `
      <div class="panel-card legal-box">
        <h3>Declaración de Privacidad y Protección de Datos Infantiles</h3>
        <p>
          <strong>El Mundo de Ximenita</strong> ha sido desarrollado bajo el principio de <em>Privacidad por Diseño</em> (Privacy by Design), cumpliendo de manera estricta:
        </p>
        <ul>
          <li><strong>Ley Peruana N° 29733 (Ley de Protección de Datos Personales):</strong> No se solicita, recolecta ni almacena información personal identificable (PII) de los menores. Todo el historial pedagógico reside exclusivamente en el dispositivo local (LocalStorage del navegador).</li>
          <li><strong>COPPA (Children's Online Privacy Protection Act):</strong> Cero rastreo, cero cookies de terceros y ausencia absoluta de publicidad o analíticas externas.</li>
          <li><strong>GDPR-K (Reglamento General de Protección de Datos de la Unión Europea para menores):</strong> Perfiles completamente anónimos y portabilidad local de progreso.</li>
        </ul>

        <h3>Marco Pedagógico y Curricular CNEB</h3>
        <p>
          Las actividades y curvas de dificultad de los 10 mini-juegos responden a las competencias del <strong>Currículo Nacional de la Educación Básica (CNEB) del Perú</strong>, articulando de manera lúdica:
        </p>
        <ul>
          <li><strong>Área de Matemática:</strong> "Resuelve problemas de cantidad" y "Resuelve problemas de forma, movimiento y localización".</li>
          <li><strong>Área de Comunicación:</strong> "Se comunica oralmente en su lengua materna" y "Escribe diversos tipos de textos".</li>
          <li><strong>Área de Personal Social y Ciencia y Tecnología:</strong> "Indaga mediante métodos científicos" y autorregulación emocional frente al error sin estado de derrota.</li>
        </ul>

        <h3>Términos de Uso y Derechos de Autor</h3>
        <p>
          El software se distribuye con todos los derechos reservados para fines educativos. Los personajes animales están inspirados en conceptos circenses digitales fantásticos con adaptaciones faunísticas autóctonas e internacionales.
        </p>
        <p>
          <strong>Créditos de Audio y Gráficos:</strong> Efectos sonoros generados en tiempo real mediante Web Audio API y síntesis fonológica nativa del navegador. Ilustraciones vectoriales en SVG puro desarrolladas para El Mundo de Ximenita.
        </p>
      </div>
    `;
  }

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

    // Cambio de Perfil
    const profileDropdown = this.container.querySelector('#profile-select-dropdown') as HTMLSelectElement;
    profileDropdown?.addEventListener('change', async (e) => {
      const selectedId = (e.target as HTMLSelectElement).value;
      await progressService.setActiveProfile(selectedId);
      await this.refreshData();
      this.render();
    });

    // Añadir nuevo perfil
    const addProfileBtn = this.container.querySelector('#add-profile-btn');
    addProfileBtn?.addEventListener('click', async () => {
      const name = prompt('Ingrese el nombre o apodo del estudiante (ej. Sofía):');
      if (name && name.trim()) {
        await progressService.createProfile(name.trim(), 'inicial');
        await this.refreshData();
        this.render();
      }
    });

    // Alternar modo oscuro
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    themeBtn?.addEventListener('click', () => {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      localStorage.setItem('ximenita_dark_mode', this.isDarkMode ? 'true' : 'false');
      this.render();
    });

    // Guardar velocidad de voz
    const voiceSelect = this.container.querySelector('#voice-speed-select') as HTMLSelectElement;
    voiceSelect?.addEventListener('change', async () => {
      const spd = voiceSelect.value as any;
      speechService.setSpeed(spd);
      await progressService.updateSettings({ voiceSpeed: spd });
    });

    // Guardar límite diario
    const timeLimitSelect = this.container.querySelector('#time-limit-select') as HTMLSelectElement;
    timeLimitSelect?.addEventListener('change', async () => {
      const mins = parseInt(timeLimitSelect.value, 10);
      await progressService.updateSettings({ dailyTimeLimitMinutes: mins });
    });

    // Alternar música
    const musicCheck = this.container.querySelector('#music-toggle-check') as HTMLInputElement;
    musicCheck?.addEventListener('change', async () => {
      await progressService.updateSettings({ musicEnabled: musicCheck.checked });
    });

    // Reinicio de datos con confirmación doble
    const resetBtn = this.container.querySelector('#reset-profile-btn');
    resetBtn?.addEventListener('click', async () => {
      const firstConfirm = confirm('¿Está seguro de que desea reiniciar el progreso del perfil seleccionado?');
      if (firstConfirm) {
        const secondConfirm = confirm('Esta acción no se puede deshacer. ¿Confirma el reinicio de estrellas y actividades?');
        if (secondConfirm) {
          await progressService.reset(this.activeProfile?.id);
          await this.refreshData();
          this.render();
          alert('El progreso ha sido reiniciado con éxito.');
        }
      }
    });
  }
}
