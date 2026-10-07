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
          <div class="gangle-bubble" style="background: #FFF; padding: 10px 18px; border-radius: 20px; border: 3px solid #22C55E; font-size: 19px; font-weight: 700; color: #15803D;">
            🐸 Gangle dice: "¡Dibuja la letra sin soltar tu dedito!"
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
    this.tracingService = new TracingService(canvas, 0.50);

    const fillBar = this.container.querySelector('#letter-coverage-bar') as HTMLElement;
    this.tracingService.setOnStrokeUpdate((cov) => {
      const pct = Math.min(100, Math.round(cov * 100));
      fillBar.style.width = `${pct}%`;
      if (pct >= 50) {
        fillBar.style.background = 'linear-gradient(90deg, #10B981, #059669)';
        fillBar.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6)';
      } else {
        fillBar.style.background = 'linear-gradient(90deg, #F59E0B, #EAB308)';
        fillBar.style.boxShadow = 'none';
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
    if (fillBar) fillBar.style.width = '0%';

    this.ximenita?.narrate(`¡Tracemos la letra ${this.currentLetter}!`);
  }

  private evaluateStroke(): void {
    if (!this.tracingService) return;
    const result = this.tracingService.evaluate();

    if (result.passed) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien!');

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1800);
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Casi lo logras! Sigue la línea azul un poquito más con tu dedito.');
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
