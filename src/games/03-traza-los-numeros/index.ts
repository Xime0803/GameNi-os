import { audioService } from '../../core/audioService';
import { numberToSpanishWord } from '../../core/numberWords';
import { DifficultyService } from '../../core/difficultyService';
import { getNumberGuide } from '../../core/numberPaths';
import { TracingService } from '../../core/tracingService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

export class TrazaLosNumerosGame implements MiniGame {
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
  private targetNumber: number = 1;

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
      <div class="trazado-game">
        <div class="game-header-info">
          <h2>✍️ Traza los números (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="trazado-stage">
          <div class="kinger-bubble" style="background: #FFF; padding: 10px 18px; border-radius: 20px; border: 3px solid #EAB308; font-size: 19px; font-weight: 700; color: #854D0E;">
            🐘 Kinger dice: "¡Sigue el caminito mágico sin salirte!"
          </div>
          <div class="canvas-card-wrapper">
            <canvas id="tracing-canvas" class="tracing-canvas" width="280" height="380"></canvas>
            <div class="coverage-bar-container">
              <div id="coverage-bar-fill" class="coverage-bar-fill"></div>
            </div>
          </div>
          <div class="trazado-actions">
            <div id="btn-clear-slot"></div>
            <div id="btn-check-slot"></div>
          </div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const canvas = this.container.querySelector('#tracing-canvas') as HTMLCanvasElement;
    this.tracingService = new TracingService(canvas, 0.65);

    const fillBar = this.container.querySelector('#coverage-bar-fill') as HTMLElement;
    const msgEl = this.container.querySelector('#kinger-message') as HTMLElement | null;

    this.tracingService.setOnStrokeUpdate((cov, isOffTrack) => {
      const pct = Math.min(100, Math.round(cov * 100));
      fillBar.style.width = `${pct}%`;

      if (isOffTrack) {
        fillBar.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
        fillBar.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.7)';
        if (msgEl) {
          msgEl.textContent = '⚠️ ¡Cuidado, te saliste de la línea! Usa "Borrar" para empezar de nuevo.';
          msgEl.style.color = '#DC2626';
        }
      } else if (cov >= 0.65) {
        fillBar.style.background = 'linear-gradient(90deg, #10B981, #059669)';
        fillBar.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.7)';
        if (msgEl) {
          msgEl.textContent = '✨ ¡Genial! ¡Lo lograste sin salirte! Presiona "¡Listo!"';
          msgEl.style.color = '#059669';
        }
      } else {
        fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
        fillBar.style.boxShadow = 'none';
        if (msgEl) {
          msgEl.textContent = '🐘 Kinger dice: "¡Sigue el caminito mágico sin salirte!"';
          msgEl.style.color = '#4B5563';
        }
      }
    });

    const clearBtn = new BigButton({
      icon: '🔄',
      text: 'Borrar',
      color: 'lavender',
      ariaLabel: 'Borrar trazo para intentar de nuevo',
      onClick: () => {
        this.tracingService?.clear();
        fillBar.style.width = '0%';
        fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
        fillBar.style.boxShadow = 'none';
        if (msgEl) {
          msgEl.textContent = '🐘 Kinger dice: "¡Sigue el caminito mágico sin salirte!"';
          msgEl.style.color = '#4B5563';
        }
        audioService.playClick();
      },
    });
    this.container.querySelector('#btn-clear-slot')?.appendChild(clearBtn.getElement());

    const checkBtn = new BigButton({
      icon: '✨',
      text: '¡Listo!',
      color: 'leaf',
      ariaLabel: 'Verificar trazo del número',
      onClick: () => this.evaluateStroke(),
    });
    this.container.querySelector('#btn-check-slot')?.appendChild(checkBtn.getElement());

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    audioService.playAnimalVocal('kinger');
    setTimeout(() => {
      this.ximenita?.narrate('¡Empieza en el punto rojo y desliza tu dedito sobre la línea azul!');
    }, 400);
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

    // Determinar número a trazar según nivel
    const lvl = this.difficulty.getLevel();
    if (lvl === 1) {
      this.targetNumber = (this.currentRound % 3) + 1; // 1, 2, 3
    } else if (lvl === 2) {
      this.targetNumber = (this.currentRound % 6) + 1; // 1 a 6
    } else if (lvl === 3) {
      this.targetNumber = (this.currentRound % 9) + 1; // 1 a 9
    } else {
      this.targetNumber = this.currentRound * 2; // decenas/pares
    }

    const guide = getNumberGuide(this.targetNumber);
    this.tracingService.setGuide(guide);

    const fillBar = this.container.querySelector('#coverage-bar-fill') as HTMLElement;
    if (fillBar) {
      fillBar.style.width = '0%';
      fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
      fillBar.style.boxShadow = 'none';
    }

    const msgEl = this.container.querySelector('#kinger-message') as HTMLElement | null;
    if (msgEl) {
      msgEl.textContent = '🐘 Kinger dice: "¡Sigue el caminito mágico sin salirte!"';
      msgEl.style.color = '#4B5563';
    }

    const word = numberToSpanishWord(this.targetNumber);
    this.ximenita?.narrate(`¡Tracemos el número ${word}!`);
  }

  private evaluateStroke(): void {
    if (!this.tracingService) return;
    const result = this.tracingService.evaluate();
    const msgEl = this.container?.querySelector('#kinger-message') as HTMLElement | null;

    if (result.passed) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien sin salirte!');
      if (msgEl) {
        msgEl.textContent = '🎉 ¡Excelente! ¡Lo trazaste perfecto!';
        msgEl.style.color = '#059669';
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
      }
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Casi lo logras! Te faltó completar un pedacito de la línea azul.');
      if (msgEl) {
        msgEl.textContent = '✏️ ¡Casi! Traza un poquito más para completar el número.';
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
      skillWorked: 'Pre-escritura, direccionalidad y trazado motriz de números',
      area: this.config.area,
    });
  }
}
