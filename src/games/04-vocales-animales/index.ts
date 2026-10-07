import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

interface AnimalVowelItem {
  name: string;
  vowel: 'A' | 'E' | 'I' | 'O' | 'U';
  emoji: string;
}

const ITEMS: AnimalVowelItem[] = [
  { name: 'Abeja', vowel: 'A', emoji: '🐝' },
  { name: 'Ardilla', vowel: 'A', emoji: '🐿️' },
  { name: 'Elefante', vowel: 'E', emoji: '🐘' },
  { name: 'Erizo', vowel: 'E', emoji: '🦔' },
  { name: 'Iguana', vowel: 'I', emoji: '🦎' },
  { name: 'Oso', vowel: 'O', emoji: '🐻' },
  { name: 'Oveja', vowel: 'O', emoji: '🐑' },
  { name: 'Urraca', vowel: 'U', emoji: '🦅' },
];

export class VocalesAnimalesGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private currentItem: AnimalVowelItem = ITEMS[0];

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
      <div class="vocales-game">
        <div class="game-header-info">
          <h2>🔤 Vocales animales (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="vocales-stage">
          <div class="ragatha-bubble" style="background: #FFF; padding: 10px 18px; border-radius: 20px; border: 3px solid #F97316; font-size: 19px; font-weight: 700; color: #C2410C;">
            🦁 Ragatha dice: "¡Descubramos juntos la primera letra de cada amigo!"
          </div>
          <div class="animal-display-card">
            <span class="animal-display-emoji" id="vowel-animal-emoji">🐝</span>
            <span class="animal-display-name" id="vowel-animal-name">Abeja</span>
          </div>
          <div class="vowel-buttons-row" id="vowel-buttons-row"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    audioService.playAnimalVocal('ragatha');
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

    this.currentItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    const emojiEl = this.container.querySelector('#vowel-animal-emoji');
    const nameEl = this.container.querySelector('#vowel-animal-name');
    if (emojiEl) emojiEl.textContent = this.currentItem.emoji;
    if (nameEl) nameEl.textContent = this.currentItem.name;

    const row = this.container.querySelector('#vowel-buttons-row') as HTMLElement;
    row.innerHTML = '';

    const vowels: ('A' | 'E' | 'I' | 'O' | 'U')[] = ['A', 'E', 'I', 'O', 'U'];
    vowels.forEach((v) => {
      const btn = new BigButton({
        text: v,
        color: v === 'A' ? 'coral' : v === 'E' ? 'sun' : v === 'I' ? 'leaf' : v === 'O' ? 'sky' : 'lavender',
        ariaLabel: `Vocal ${v}`,
        onClick: () => this.handlePick(v),
      });
      row.appendChild(btn.getElement());
    });

    setTimeout(() => {
      this.ximenita?.narrate(`¿Con qué vocal empieza ${this.currentItem.name}?`);
    }, 300);
  }

  private handlePick(vowel: string): void {
    if (vowel === this.currentItem.vowel) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate(`¡Excelente! ¡${this.currentItem.name} empieza con la vocal ${vowel}!`);

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1500);
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint(`Casi. Escucha el sonido inicial: ¡${this.currentItem.name}!`);
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
      skillWorked: 'Discriminación fonológica y reconocimiento de vocal inicial',
      area: this.config.area,
    });
  }
}
