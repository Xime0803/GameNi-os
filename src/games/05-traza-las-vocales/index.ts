import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { getLetterGuide } from '../../core/letterPaths';
import { TracingService } from '../../core/tracingService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

const LETTERS_SEQUENCE = ['A', 'E', 'I', 'O', 'U', 'M', 'P', 'S'];

export class TrazaLasVocalesGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;
  private tracingService: TracingService | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private currentLetter: string = 'A';

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.ximenita = new XimenitaComponent('artist');

    this.renderShell();
    this.startRound();
  }

  public unmount(): void {
    if (this.ximenita) {
      this.ximenita.destroy();
      this.ximenita = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }

  private renderShell(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="traza-vocales-game">
        <div class="game-header-info">
          <h2>🎨 Traza las vocales (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="traza-vocales-stage">
          <div class="gangle-bubble" id="gangle-message" style="background: #FFF; padding: 10px 18px; border-radius: 20px; border: 3px solid #22C55E; font-size: 19px; font-weight: 700; color: #15803D;">
            🐸 Gangle dice: "¡Dibuja la letra sin salirte del caminito!"
          </div>
          <div class="canvas-card-wrapper">
            <canvas id="letter-canvas" class="tracing-canvas" width="280" height="380"></canvas>
            <div class="coverage-bar-container">
              <div id="letter-coverage-bar" class="coverage-bar-fill"></div>
            </div>
          </div>
          <div class="trazado-actions">
            <div id="btn-letter-clear"></div>
            <div id="btn-letter-check"></div>
          </div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const canvas = this.container.querySelector('#letter-canvas') as HTMLCanvasElement;
    this.tracingService = new TracingService(canvas, 0.65);

    const fillBar = this.container.querySelector('#letter-coverage-bar') as HTMLElement;
    const msgEl = this.container.querySelector('#gangle-message') as HTMLElement | null;

    this.tracingService.setOnStrokeUpdate((cov, isOffTrack) => {
      const pct = Math.min(100, Math.round(cov * 100));
      fillBar.style.width = `${pct}%`;

      if (isOffTrack) {
        fillBar.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
        fillBar.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.7)';
        if (msgEl) {
          msgEl.textContent = '⚠️ ¡Cuidado, te saliste de la línea! Usa "Borrar" para empezar de nuevo.';
          msgEl.style.color = '#DC2626';
          msgEl.style.borderColor = '#EF4444';
        }
      } else if (cov >= 0.65) {
        fillBar.style.background = 'linear-gradient(90deg, #10B981, #059669)';
        fillBar.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.7)';
        if (msgEl) {
          msgEl.textContent = '✨ ¡Genial! ¡Lo lograste sin salirte! Presiona "¡Listo!"';
          msgEl.style.color = '#15803D';
          msgEl.style.borderColor = '#22C55E';
        }
      } else {
        fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
        fillBar.style.boxShadow = 'none';
        if (msgEl) {
          msgEl.textContent = '🐸 Gangle dice: "¡Dibuja la letra sin salirte del caminito!"';
          msgEl.style.color = '#15803D';
          msgEl.style.borderColor = '#22C55E';
        }
      }
    });

    const clearBtn = new BigButton({
      icon: '🔄',
      text: 'Borrar',
      color: 'lavender',
      ariaLabel: 'Borrar letra',
      onClick: () => {
        this.tracingService?.clear();
        fillBar.style.width = '0%';
        fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
        fillBar.style.boxShadow = 'none';
        if (msgEl) {
          msgEl.textContent = '🐸 Gangle dice: "¡Dibuja la letra sin salirte del caminito!"';
          msgEl.style.color = '#15803D';
          msgEl.style.borderColor = '#22C55E';
        }
        audioService.playClick();
      },
    });
    this.container.querySelector('#btn-letter-clear')?.appendChild(clearBtn.getElement());

    const checkBtn = new BigButton({
      icon: '✨',
      text: '¡Listo!',
      color: 'leaf',
      ariaLabel: 'Verificar trazo de la letra',
      onClick: () => this.evaluateStroke(),
    });
    this.container.querySelector('#btn-letter-check')?.appendChild(checkBtn.getElement());

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    audioService.playAnimalVocal('gangle');
  }

  private startRound(): void {
    if (!this.container || !this.tracingService) return;
    this.currentRound++;

    if (this.currentRound > this.config.rounds) {
      this.finishGame();
      return;
    }

    const roundNumEl = this.container.querySelector('#round-num');
    if (roundNumEl) roundNumEl.textContent = this.currentRound.toString();

    const idx = (this.currentRound - 1) % LETTERS_SEQUENCE.length;
    this.currentLetter = LETTERS_SEQUENCE[idx];

    const guide = getLetterGuide(this.currentLetter);
    this.tracingService.setGuide(guide);

    const fillBar = this.container.querySelector('#letter-coverage-bar') as HTMLElement;
    if (fillBar) {
      fillBar.style.width = '0%';
      fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
      fillBar.style.boxShadow = 'none';
    }

    const msgEl = this.container.querySelector('#gangle-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.textContent = '🐸 Gangle dice: "¡Dibuja la letra sin salirte del caminito!"';
      msgEl.style.color = '#15803D';
      msgEl.style.borderColor = '#22C55E';
    }

    this.ximenita?.narrate(`¡Tracemos la letra ${this.currentLetter}!`);
  }

  private evaluateStroke(): void {
    if (!this.tracingService) return;
    const result = this.tracingService.evaluate();
    const msgEl = this.container?.querySelector('#gangle-message') as HTMLElement | null;

    if (result.passed) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien sin salirte!');
      if (msgEl) {
        msgEl.textContent = '🎉 ¡Excelente! ¡Lo trazaste perfecto!';
        msgEl.style.color = '#15803D';
      }

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1800);
    } else if (result.wentOffTrack) {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Te saliste de la línea! Presiona Borrar y sigue el caminito azul despacito.');
      if (msgEl) {
        msgEl.textContent = '❌ ¡Te saliste del caminito! Borra e inténtalo otra vez despacito.';
        msgEl.style.color = '#DC2626';
        msgEl.style.borderColor = '#EF4444';
      }
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Casi lo logras! Te faltó completar un pedacito de la línea azul.');
      if (msgEl) {
        msgEl.textContent = '✏️ ¡Casi! Traza un poquito más para completar la letra.';
        msgEl.style.color = '#D97706';
      }
    }
  }

  private finishGame(): void {
    if (!this.onComplete) return;
    this.onComplete({
      gameId: this.config.id,
      finalLevel: this.difficulty.getLevel(),
      hits: this.hits,
      misses: this.misses,
      timeSpentMs: Date.now() - this.startTime,
      skillWorked: 'Pre-escritura y trazo de vocales y consonantes',
      area: this.config.area,
    });
  }
}
