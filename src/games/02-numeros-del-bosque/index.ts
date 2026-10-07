import { audioService } from '../../core/audioService';
import { speechService } from '../../core/speechService';
import { numberToSpanishWord } from '../../core/numberWords';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

export class NumerosDelBosqueGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private targetNumber: number = 0;

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.ximenita = new XimenitaComponent('explorer');

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
      <div class="bosque-game">
        <div class="game-header-info">
          <h2>🌲 Números del bosque (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="bosque-stage">
          <div class="jax-bubble" style="background: #FFF; padding: 12px 20px; border-radius: 20px; border: 3px solid #A855F7; font-size: 20px; font-weight: 700; color: #7E22CE;">
            🐰 Jax dice: "¡Atrapa el número que suena!"
          </div>
          <button class="listen-again-btn" id="listen-again-btn">
            🔊 ¡Escuchar de nuevo!
          </button>
          <div class="forest-trees-grid" id="trees-grid"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    const listenBtn = this.container.querySelector('#listen-again-btn');
    listenBtn?.addEventListener('click', () => {
      audioService.playClick();
      this.speakTarget();
    });

    audioService.playAnimalVocal('jax');
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

    // Rango según nivel
    const level = this.difficulty.getLevel();
    let min = 1;
    let max = 5;
    let countTrees = 3;
    if (level === 2) { min = 1; max = 10; countTrees = 4; }
    else if (level === 3) { min = 10; max = 20; countTrees = 4; }
    else if (level === 4) { min = 20; max = 50; countTrees = 5; }
    else if (level === 5) { min = 50; max = 100; countTrees = 5; }

    this.targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Generar opciones con árboles
    const numbersSet = new Set<number>([this.targetNumber]);
    while (numbersSet.size < countTrees) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const cand = Math.max(min, Math.min(max, this.targetNumber + delta));
      numbersSet.add(cand);
    }
    const numbers = Array.from(numbersSet).sort(() => Math.random() - 0.5);

    const treesGrid = this.container.querySelector('#trees-grid') as HTMLElement;
    treesGrid.innerHTML = '';

    numbers.forEach((num) => {
      const card = document.createElement('div');
      card.className = 'tree-card';
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Árbol con el número ${num}`);
      card.innerHTML = `
        <span class="tree-icon">🌲</span>
        <span class="tree-number">${num}</span>
      `;

      card.addEventListener('pointerdown', (e: Event) => {
        e.preventDefault();
        this.handlePick(num, card);
      });
      treesGrid.appendChild(card);
    });

    setTimeout(() => this.speakTarget(), 250);
  }

  private speakTarget(): void {
    const word = numberToSpanishWord(this.targetNumber);
    this.ximenita?.narrate(`¡Busca el número ${word}!`);
  }

  private handlePick(picked: number, cardEl?: HTMLElement): void {
    // 1. Tono melódico instantáneo a 0ms de latencia
    audioService.playNumberTone(picked);

    if (picked === this.targetNumber) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      cardEl?.classList.add('card-correct');
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
      cardEl?.classList.add('card-shake');
      setTimeout(() => cardEl?.classList.remove('card-shake'), 600);

      // Pronuncia el número tocado y anima a buscar el correcto
      speechService.speakNumber(picked, 'Tocaste el', () => {
        this.ximenita?.giveHint('¡Vamos, tú puedes! ¡Inténtalo de nuevo!');
      });
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
      skillWorked: 'Reconocimiento y discriminación auditiva de números del 1 al 100',
      area: this.config.area,
    });
  }
}
