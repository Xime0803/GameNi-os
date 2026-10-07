import { progressService } from '../core/progressService';

export class ParentalGate {
  private container: HTMLElement;
  private numA: number = 0;
  private numB: number = 0;
  private correctAnswer: number = 0;
  private onUnlocked: () => void;

  constructor(onUnlocked: () => void) {
    this.onUnlocked = onUnlocked;
    this.container = document.createElement('div');
    this.container.className = 'parental-gate-overlay';
    this.generateMathProblem();
  }

  private generateMathProblem(): void {
    // Suma de dos dígitos exigente para un niño de 3 a 6 años (ej. 17 + 26)
    this.numA = Math.floor(Math.random() * 20) + 14; // 14 a 33
    this.numB = Math.floor(Math.random() * 25) + 12; // 12 a 36
    this.correctAnswer = this.numA + this.numB;
  }

  public async render(parent: HTMLElement): Promise<void> {
    const settings = await progressService.getSettings();
    const storedPass = settings.adultPassword || '1234';

    this.container.innerHTML = `
      <div class="parental-gate-modal" role="dialog" aria-labelledby="gate-title">
        <div class="gate-icon-shield">🛡️</div>
        <h2 id="gate-title" class="gate-title">Zona Exclusiva para Familias y Docentes</h2>
        <p class="gate-desc">
          Para garantizar la seguridad de los niños y proteger los ajustes, resuelva el siguiente cálculo aritmético o ingrese la clave de adulto.
        </p>

        <div class="gate-challenge-box">
          <div class="challenge-label">Pregunta de Seguridad Parental:</div>
          <div class="challenge-equation">¿Cuánto es <strong>${this.numA} + ${this.numB}</strong>?</div>
          <input
            type="number"
            id="gate-math-input"
            class="gate-input"
            placeholder="Resultado"
            autocomplete="off"
            aria-label="Resultado de la operación matemática"
          />
        </div>

        <div class="gate-password-accordion">
          <details>
            <summary>¿Prefiere ingresar con contraseña de adulto?</summary>
            <div style="margin-top: 10px;">
              <input
                type="password"
                id="gate-pass-input"
                class="gate-input"
                placeholder="Contraseña (por defecto: 1234)"
                aria-label="Contraseña de adulto"
              />
            </div>
          </details>
        </div>

        <div id="gate-error-msg" class="gate-error" style="display: none;"></div>

        <div class="gate-actions">
          <a href="./index.html" class="gate-btn gate-btn-secondary">🎪 Volver al Menú Principal</a>
          <button id="gate-submit-btn" class="gate-btn gate-btn-primary">Verificar e Ingresar</button>
        </div>
      </div>
    `;

    parent.appendChild(this.container);
    this.injectStylesOnce();

    const submitBtn = this.container.querySelector('#gate-submit-btn');
    const mathInput = this.container.querySelector('#gate-math-input') as HTMLInputElement;
    const passInput = this.container.querySelector('#gate-pass-input') as HTMLInputElement;
    const errorEl = this.container.querySelector('#gate-error-msg') as HTMLElement;

    const checkSolution = () => {
      const mathVal = parseInt(mathInput.value.trim(), 10);
      const passVal = passInput?.value.trim();

      if (mathVal === this.correctAnswer || (passVal && passVal === storedPass)) {
        this.container.remove();
        this.onUnlocked();
      } else {
        errorEl.textContent = 'Respuesta o contraseña incorrecta. Por favor intente nuevamente.';
        errorEl.style.display = 'block';
        this.generateMathProblem();
        const eqEl = this.container.querySelector('.challenge-equation');
        if (eqEl) {
          eqEl.innerHTML = `¿Cuánto es <strong>${this.numA} + ${this.numB}</strong>?`;
        }
        mathInput.value = '';
        mathInput.focus();
      }
    };

    submitBtn?.addEventListener('click', checkSolution);
    mathInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkSolution();
    });
    passInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkSolution();
    });

    mathInput.focus();
  }

  private injectStylesOnce(): void {
    if (document.getElementById('parental-gate-styles')) return;

    const style = document.createElement('style');
    style.id = 'parental-gate-styles';
    style.textContent = `
      .parental-gate-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        padding: 20px;
      }

      .parental-gate-modal {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 36px 32px;
        max-width: 520px;
        width: 100%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid #E2E8F0;
        text-align: center;
      }

      .gate-icon-shield {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .gate-title {
        font-size: 22px;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 8px;
        line-height: 1.3;
      }

      .gate-desc {
        font-size: 14px;
        color: #475569;
        margin-bottom: 24px;
        line-height: 1.5;
      }

      .gate-challenge-box {
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 16px;
      }

      .challenge-label {
        font-size: 13px;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
      }

      .challenge-equation {
        font-size: 24px;
        color: #1E293B;
        margin-bottom: 14px;
      }

      .gate-input {
        width: 100%;
        max-width: 260px;
        padding: 10px 16px;
        border-radius: 8px;
        border: 2px solid #CBD5E1;
        font-size: 18px;
        text-align: center;
        font-weight: 600;
        color: #0F172A;
        outline: none;
        transition: border-color 0.2s;
      }

      .gate-input:focus {
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
      }

      .gate-password-accordion {
        margin-bottom: 20px;
        font-size: 13px;
        color: #64748B;
        text-align: left;
      }

      .gate-password-accordion summary {
        cursor: pointer;
        user-select: none;
      }

      .gate-error {
        color: #DC2626;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 16px;
        padding: 8px;
        background: #FEE2E2;
        border-radius: 6px;
      }

      .gate-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .gate-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .gate-btn-secondary {
        background: #F1F5F9;
        color: #475569;
        border: 1px solid #CBD5E1;
      }

      .gate-btn-secondary:hover {
        background: #E2E8F0;
      }

      .gate-btn-primary {
        background: #2563EB;
        color: #FFFFFF;
        border: 1px solid #1D4ED8;
      }

      .gate-btn-primary:hover {
        background: #1D4ED8;
      }
    `;
    document.head.appendChild(style);
  }
}
