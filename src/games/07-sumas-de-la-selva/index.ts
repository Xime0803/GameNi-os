import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

export class SumasDeLaSelvaGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private opA: number = 1;
  private opB: number = 1;
  private sumResult: number = 2;

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.ximenita = new XimenitaComponent('chef');

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
      <div class="sumas-game">
        <div class="game-header-info">
          <h2>➕ Sumas de la selva (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="sumas-stage">
          <div class="equation-card">
            <div id="cluster-a" class="fruit-cluster"></div>
            <span>+</span>
            <div id="cluster-b" class="fruit-cluster"></div>
            <span>=</span>
            <span>❓</span>
          </div>
          <div class="options-row" id="sum-options-row"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    setTimeout(() => {
      this.ximenita?.narrate('¡Junta las deliciosas frutas y averigua cuántas hay en total!');
    }, 350);
  }

  private startRound(): void {
    if (!this.container) return;
    this.currentRound++;

    if (this.currentRound > this.config.rounds) {
      this.finishGame();
      return;
    }

    const roundNumEl = this.container.querySelector('#round-num');
    if (roundNumEl) roundNumEl.textContent = this.currentRound.toString();

    const lvl = this.difficulty.getLevel();
    if (lvl === 1) {
      this.opA = Math.floor(Math.random() * 3) + 1;
      this.opB = Math.floor(Math.random() * 3) + 1;
    } else if (lvl === 2) {
      this.opA = Math.floor(Math.random() * 5) + 1;
      this.opB = Math.floor(Math.random() * 5) + 1;
    } else if (lvl === 3) {
      this.opA = Math.floor(Math.random() * 8) + 2;
      this.opB = Math.floor(Math.random() * 8) + 2;
    } else {
      this.opA = (Math.floor(Math.random() * 4) + 1) * 10;
      this.opB = (Math.floor(Math.random() * 4) + 1) * 10;
    }
    this.sumResult = this.opA + this.opB;

    const clusterA = this.container.querySelector('#cluster-a') as HTMLElement;
    const clusterB = this.container.querySelector('#cluster-b') as HTMLElement;

    // Renderizar frutas (hasta 10 íconos para no saturar visualmente)
    clusterA.innerHTML = this.opA <= 10 ? '🍎'.repeat(this.opA) : `${this.opA} 🍎`;
    clusterB.innerHTML = this.opB <= 10 ? '🍊'.repeat(this.opB) : `${this.opB} 🍊`;

    const opts = new Set<number>([this.sumResult]);
    while (opts.size < 3) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (lvl >= 4 ? 10 : Math.floor(Math.random() * 3) + 1);
      opts.add(Math.max(1, this.sumResult + delta));
    }
    const optionsArray = Array.from(opts).sort(() => Math.random() - 0.5);

    const row = this.container.querySelector('#sum-options-row') as HTMLElement;
    row.innerHTML = '';

    optionsArray.forEach((num) => {
      const btn = new BigButton({
        text: num.toString(),
        color: 'sun',
        ariaLabel: `Opción suma ${num}`,
        onClick: () => this.handlePick(num),
      });
      row.appendChild(btn.getElement());
    });

    this.ximenita?.narrate(`¿Cuánto es ${this.opA} más ${this.opB}?`);
  }

  private handlePick(chosen: number): void {
    if (chosen === this.sumResult) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate(`¡Excelente! ¡${this.opA} más ${this.opB} es igual a ${this.sumResult}!`);

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1500);
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint(`Casi. Cuenta las manzanas y las naranjas juntas.`);
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
      skillWorked: 'Resolución de problemas de cantidad y adición hasta 100',
      area: this.config.area,
    });
  }
}
