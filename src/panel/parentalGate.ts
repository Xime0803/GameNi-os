import { progressService } from '../core/progressService';
import { AuthSession } from '../core/types';

export class ParentalGate {
  private container: HTMLElement;
  private onUnlocked: (session: AuthSession) => void;
  private activeTab: 'code' | 'admin' = 'code';

  constructor(onUnlocked: (session: AuthSession) => void) {
    this.onUnlocked = onUnlocked;
    this.container = document.createElement('div');
    this.container.className = 'parental-gate-overlay';
  }

  public async render(parent: HTMLElement): Promise<void> {
    // Verificar si ya existe una sesión guardada activa
    const existingSession = await progressService.getAuthSession();
    if (existingSession) {
      this.onUnlocked(existingSession);
      return;
    }

    this.renderModal();
    parent.appendChild(this.container);
    this.injectStylesOnce();
  }

  private renderModal(): void {
    this.container.innerHTML = `
      <div class="auth-portal-card" role="dialog" aria-labelledby="portal-title">
        <!-- Encabezado Institucional -->
        <div class="auth-header">
          <div class="auth-logo-badge">🏛️</div>
          <h2 id="portal-title" class="auth-title">Plataforma Pedagógica y Familiar</h2>
          <p class="auth-subtitle">El Mundo de Ximenita • Sistema de Seguimiento Curricular CNEB</p>
        </div>

        <!-- Selector de Tipo de Acceso -->
        <div class="auth-mode-tabs" role="tablist">
          <button
            id="tab-code-btn"
            class="auth-tab-btn ${this.activeTab === 'code' ? 'active' : ''}"
            role="tab"
            aria-selected="${this.activeTab === 'code'}"
          >
            🔑 Acceso Familias (Código 6 Dígitos)
          </button>
          <button
            id="tab-admin-btn"
            class="auth-tab-btn ${this.activeTab === 'admin' ? 'active' : ''}"
            role="tab"
            aria-selected="${this.activeTab === 'admin'}"
          >
            🛡️ Administrador / Docente
          </button>
        </div>

        <!-- Formulario: Código de 6 Dígitos -->
        <div id="section-code" class="auth-section" style="${this.activeTab === 'code' ? 'display: block;' : 'display: none;'}">
          <p class="auth-instructions">
            Ingrese el <strong>código único de 6 dígitos</strong> entregado por el docente para visualizar el progreso individual, competencias CNEB y recomendaciones de su hijo/a.
          </p>

          <div class="code-input-wrapper">
            <input
              type="text"
              id="student-code-input"
              class="code-input-large"
              placeholder="Ej: 102938"
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              aria-label="Código de acceso de 6 dígitos"
            />
          </div>

          <div id="code-error-msg" class="auth-error-box" style="display: none;"></div>

          <button id="btn-submit-code" class="auth-btn-primary">
            Ingresar al Reporte del Estudiante
          </button>
        </div>

        <!-- Formulario: Administrador / Docente -->
        <div id="section-admin" class="auth-section" style="${this.activeTab === 'admin' ? 'display: block;' : 'display: none;'}">
          <p class="auth-instructions">
            Ingrese sus credenciales de <strong>Administrador o Docente Titular</strong> para crear estudiantes, generar códigos únicos y ver métricas de cohorte.
          </p>

          <div class="admin-fields-group">
            <div class="admin-field">
              <label for="admin-user-input">Usuario Institucional</label>
              <input
                type="text"
                id="admin-user-input"
                class="admin-input"
                value="admin"
                placeholder="admin"
                autocomplete="username"
              />
            </div>
            <div class="admin-field">
              <label for="admin-pass-input">Contraseña de Administrador</label>
              <input
                type="password"
                id="admin-pass-input"
                class="admin-input"
                placeholder="Predeterminada: admin (o admin123)"
                autocomplete="current-password"
              />
            </div>
          </div>

          <div id="admin-error-msg" class="auth-error-box" style="display: none;"></div>

          <button id="btn-submit-admin" class="auth-btn-primary">
            Acceder como Administrador
          </button>
        </div>

        <!-- Pie con Retorno al Circo -->
        <div class="auth-footer">
          <a href="./index.html" class="auth-return-link">
            🎪 Volver al Menú Principal / Circo Infantil
          </a>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Cambio entre pestañas
    const tabCode = this.container.querySelector('#tab-code-btn');
    const tabAdmin = this.container.querySelector('#tab-admin-btn');
    const secCode = this.container.querySelector('#section-code') as HTMLElement;
    const secAdmin = this.container.querySelector('#section-admin') as HTMLElement;

    tabCode?.addEventListener('click', () => {
      this.activeTab = 'code';
      tabCode.classList.add('active');
      tabAdmin?.classList.remove('active');
      secCode.style.display = 'block';
      secAdmin.style.display = 'none';
      const input = this.container.querySelector('#student-code-input') as HTMLInputElement;
      input?.focus();
    });

    tabAdmin?.addEventListener('click', () => {
      this.activeTab = 'admin';
      tabAdmin.classList.add('active');
      tabCode?.classList.remove('active');
      secCode.style.display = 'none';
      secAdmin.style.display = 'block';
      const input = this.container.querySelector('#admin-pass-input') as HTMLInputElement;
      input?.focus();
    });

    // Validación de Código de 6 Dígitos
    const btnSubmitCode = this.container.querySelector('#btn-submit-code');
    const codeInput = this.container.querySelector('#student-code-input') as HTMLInputElement;
    const codeError = this.container.querySelector('#code-error-msg') as HTMLElement;

    const handleCodeSubmit = async () => {
      const code = codeInput.value.trim().replace(/\D/g, '');
      if (code.length !== 6) {
        codeError.textContent = 'El código debe contener exactamente 6 dígitos numéricos.';
        codeError.style.display = 'block';
        codeInput.focus();
        return;
      }

      const profile = await progressService.getProfileByCode(code);
      if (profile) {
        codeError.style.display = 'none';
        await progressService.setActiveProfile(profile.id);
        const session: AuthSession = { role: 'parent', profileId: profile.id };
        await progressService.saveAuthSession(session);
        this.container.remove();
        this.onUnlocked(session);
      } else {
        codeError.textContent = 'Código no encontrado. Verifique con el docente o genere uno en modo Administrador.';
        codeError.style.display = 'block';
        codeInput.select();
      }
    };

    btnSubmitCode?.addEventListener('click', handleCodeSubmit);
    codeInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCodeSubmit();
    });

    // Validación de Administrador
    const btnSubmitAdmin = this.container.querySelector('#btn-submit-admin');
    const passInput = this.container.querySelector('#admin-pass-input') as HTMLInputElement;
    const adminError = this.container.querySelector('#admin-error-msg') as HTMLElement;

    const handleAdminSubmit = async () => {
      const pass = passInput.value.trim();
      const isValid = await progressService.verifyAdminPassword(pass);
      if (isValid) {
        adminError.style.display = 'none';
        const session: AuthSession = { role: 'admin' };
        await progressService.saveAuthSession(session);
        this.container.remove();
        this.onUnlocked(session);
      } else {
        adminError.textContent = 'Contraseña incorrecta. Utilice "admin" o la clave configurada.';
        adminError.style.display = 'block';
        passInput.select();
      }
    };

    btnSubmitAdmin?.addEventListener('click', handleAdminSubmit);
    passInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdminSubmit();
    });

    // Auto-focus al cargar
    setTimeout(() => {
      if (this.activeTab === 'code') {
        codeInput?.focus();
      }
    }, 150);
  }

  private injectStylesOnce(): void {
    if (document.getElementById('auth-portal-styles')) return;

    const style = document.createElement('style');
    style.id = 'auth-portal-styles';
    style.textContent = `
      .parental-gate-overlay {
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        padding: 24px;
      }

      .auth-portal-card {
        background: #FFFFFF;
        border-radius: 20px;
        padding: 38px 36px;
        max-width: 540px;
        width: 100%;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.45);
        border: 1px solid #E2E8F0;
        text-align: center;
        animation: portalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes portalFadeIn {
        from { opacity: 0; transform: translateY(16px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .auth-header {
        margin-bottom: 24px;
      }

      .auth-logo-badge {
        font-size: 44px;
        margin-bottom: 8px;
      }

      .auth-title {
        font-size: 24px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.02em;
      }

      .auth-subtitle {
        font-size: 13px;
        color: #64748B;
        margin-top: 4px;
        font-weight: 500;
      }

      .auth-mode-tabs {
        display: flex;
        gap: 8px;
        background: #F1F5F9;
        padding: 6px;
        border-radius: 12px;
        margin-bottom: 24px;
      }

      .auth-tab-btn {
        flex: 1;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        border-radius: 8px;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
      }

      .auth-tab-btn.active {
        background: #FFFFFF;
        color: #2563EB;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }

      .auth-instructions {
        font-size: 14px;
        color: #475569;
        line-height: 1.5;
        margin-bottom: 20px;
        text-align: center;
      }

      .code-input-wrapper {
        margin-bottom: 20px;
      }

      .code-input-large {
        width: 100%;
        max-width: 280px;
        padding: 14px 20px;
        font-size: 28px;
        letter-spacing: 0.35em;
        text-align: center;
        font-weight: 800;
        color: #0F172A;
        background: #F8FAFC;
        border: 2px solid #CBD5E1;
        border-radius: 12px;
        outline: none;
        transition: all 0.2s;
      }

      .code-input-large:focus {
        border-color: #2563EB;
        background: #FFFFFF;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
      }

      .admin-fields-group {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 20px;
        text-align: left;
      }

      .admin-field label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 4px;
      }

      .admin-input {
        width: 100%;
        padding: 10px 14px;
        font-size: 15px;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        background: #F8FAFC;
        outline: none;
        color: #0F172A;
        transition: border-color 0.2s;
      }

      .admin-input:focus {
        border-color: #2563EB;
        background: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
      }

      .auth-error-box {
        background: #FEE2E2;
        border: 1px solid #FECACA;
        color: #B91C1C;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 16px;
        text-align: left;
      }

      .auth-btn-primary {
        width: 100%;
        padding: 13px;
        background: #2563EB;
        color: #FFFFFF;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
      }

      .auth-btn-primary:hover {
        background: #1D4ED8;
      }

      .auth-btn-primary:active {
        transform: scale(0.99);
      }

      .auth-footer {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #E2E8F0;
      }

      .auth-return-link {
        font-size: 14px;
        color: #64748B;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
      }

      .auth-return-link:hover {
        color: #2563EB;
      }
    `;
    document.head.appendChild(style);
  }
}
