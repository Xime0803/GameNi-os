import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

export class PatronesAnimalesGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private correctChoice: string = '🐝';

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.ximenita = new XimenitaComponent('default');

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
      <div class="patrones-game">
        <div class="game-header-info">
          <h2>🚂 Patrones animales (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="patrones-stage">
          <div class="zooble-bubble" style="background: #FFF; padding: 10px 18px; border-radius: 20px; border: 3px solid #EC4899; font-size: 19px; font-weight: 700; color: #9D174D;">
            🐝 Zooble dice: "¡Mira bien las piezas y completa el tren!"
          </div>
          <div class="train-track" id="train-track"></div>
          <div class="options-row" id="pattern-options"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    setTimeout(() => {
      this.ximenita?.narrate('¿Qué animalito o figura sigue en el tren? ¡Mira el patrón!');
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

    // Patrón ABAB o AABB
    const symbols = ['🐝', '🐘', '🐒', '🐸'];
    const a = symbols[(this.currentRound - 1) % symbols.length];
    const b = symbols[this.currentRound % symbols.length];

    let pattern: string[] = [];
    if (this.difficulty.getLevel() <= 2) {
      // ABAB
      pattern = [a, b, a, b, a];
      this.correctChoice = b;
    } else {
      // AABB
      pattern = [a, a, b, b, a];
      this.correctChoice = a;
    }

    const track = this.container.querySelector('#train-track') as HTMLElement;
    track.innerHTML = '';

    pattern.forEach((sym) => {
      const wagon = document.createElement('div');
      wagon.className = 'train-wagon';
      wagon.textContent = sym;
      track.appendChild(wagon);
    });

    const targetWagon = document.createElement('div');
    targetWagon.className = 'train-wagon target-slot';
    targetWagon.textContent = '❓';
    track.appendChild(targetWagon);

    // Opciones
    const options = [a, b, symbols[(this.currentRound + 2) % symbols.length]];
    const unique = Array.from(new Set(options)).sort(() => Math.random() - 0.5);

    const optionsBox = this.container.querySelector('#pattern-options') as HTMLElement;
    optionsBox.innerHTML = '';

    unique.forEach((sym) => {
      const btn = new BigButton({
        icon: sym,
        color: 'lavender',
        ariaLabel: `Opción ${sym}`,
        onClick: () => this.handlePick(sym),
      });
      optionsBox.appendChild(btn.getElement());
    });
  }

  private handlePick(choice: string): void {
    if (choice === this.correctChoice) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate('¡Perfecto! ¡Ese es el que continuaba!');

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1500);
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('Casi. Fíjate en el ritmo de los personajes anteriores.');
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
      skillWorked: 'Pensamiento lógico y regularidades secuenciales (ABAB, AABB)',
      area: this.config.area,
    });
  }
}
