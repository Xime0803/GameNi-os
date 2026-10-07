import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

interface CardItem {
  id: number;
  emoji: string;
  name: string;
}

const ALL_CARDS = [
  { emoji: '🐒', name: 'Mono Pomni' },
  { emoji: '🐰', name: 'Conejo Jax' },
  { emoji: '🦁', name: 'Leona Ragatha' },
  { emoji: '🐸', name: 'Rana Gangle' },
  { emoji: '🐘', name: 'Elefante Kinger' },
  { emoji: '🐝', name: 'Abeja Zooble' },
];

export class MemoriaAnimalGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private deck: CardItem[] = [];
  private flippedIndices: number[] = [];
  private matchedIndices: Set<number> = new Set();

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.ximenita = new XimenitaComponent('magician');

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
      <div class="memoria-game">
        <div class="game-header-info">
          <h2>🃏 Memoria animal (Ronda <span id="round-num">1</span>/4)</h2>
        </div>
        <div class="memoria-stage">
          <div class="cards-grid" id="cards-grid"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    setTimeout(() => {
      this.ximenita?.narrate('¡Encuentra las parejas de cartas iguales tocándolas!');
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

    // 4 parejas (8 cartas) para rondas ágiles de 3 a 5 min
    const pairsCount = 4;
    const selected = ALL_CARDS.slice(0, pairsCount);
    const rawDeck = [...selected, ...selected];
    this.deck = rawDeck
      .map((item, idx) => ({ ...item, id: idx }))
      .sort(() => Math.random() - 0.5);

    this.flippedIndices = [];
    this.matchedIndices.clear();

    this.renderCards();
  }

  private renderCards(): void {
    const grid = this.container?.querySelector('#cards-grid') as HTMLElement;
    if (!grid) return;
    grid.innerHTML = '';

    this.deck.forEach((card, idx) => {
      const isFlipped = this.flippedIndices.includes(idx) || this.matchedIndices.has(idx);
      const isMatched = this.matchedIndices.has(idx);

      const cardEl = document.createElement('div');
      cardEl.className = `mem-card ${isFlipped ? 'flipped' : 'hidden-card'} ${isMatched ? 'matched' : ''}`;
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', isFlipped ? card.name : 'Carta boca abajo');
      cardEl.textContent = isFlipped ? card.emoji : '🎪';

      cardEl.addEventListener('click', () => this.handleCardClick(idx));
      grid.appendChild(cardEl);
    });
  }

  private handleCardClick(idx: number): void {
    if (this.flippedIndices.length >= 2 || this.flippedIndices.includes(idx) || this.matchedIndices.has(idx)) {
      return;
    }

    audioService.playClick();
    this.flippedIndices.push(idx);
    this.renderCards();

    if (this.flippedIndices.length === 2) {
      const [first, second] = this.flippedIndices;
      if (this.deck[first].emoji === this.deck[second].emoji) {
        // ¡Pareja encontrada!
        this.hits++;
        this.matchedIndices.add(first);
        this.matchedIndices.add(second);
        this.flippedIndices = [];
        audioService.playSuccess();
        this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien!');

        if (this.matchedIndices.size === this.deck.length) {
          // Ronda terminada
          setTimeout(() => this.startRound(), 1800);
        } else {
          this.renderCards();
        }
      } else {
        // No coinciden
        this.misses++;
        audioService.playGentleHint();
        this.ximenita?.giveHint('¡Vamos, tú puedes! ¡Inténtalo de nuevo!');
        setTimeout(() => {
          this.flippedIndices = [];
          this.renderCards();
        }, 1200);
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
      skillWorked: 'Memoria de trabajo, concentración y vocabulario zoológico',
      area: this.config.area,
    });
  }
}
