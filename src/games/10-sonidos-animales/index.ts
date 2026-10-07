import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

interface SoundAnimalItem {
  name: string;
  emoji: string;
  vocalId: string;
  onomatopoeia: string;
}

const SOUND_ANIMALS: SoundAnimalItem[] = [
  { name: 'Mono', emoji: '🐒', vocalId: 'pomni', onomatopoeia: '¡Uh-uh ah-ah!' },
  { name: 'Rana', emoji: '🐸', vocalId: 'gangle', onomatopoeia: '¡Croac croac!' },
  { name: 'Elefante', emoji: '🐘', vocalId: 'kinger', onomatopoeia: '¡Fruuuuut!' },
  { name: 'Conejo', emoji: '🐰', vocalId: 'jax', onomatopoeia: '¡Boing boing!' },
];

export class SonidosAnimalesGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private currentAnimal: SoundAnimalItem = SOUND_ANIMALS[0];

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
      <div class="sonidos-game">
        <div class="game-header-info">
          <h2>🎶 Sonidos del mundo animal (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="sonidos-stage">
          <div class="sound-box" id="sound-box" role="button" aria-label="Tocar para escuchar el sonido del animal">
            <span>🔊 ❓</span>
            <div style="font-size: 18px; font-weight: 700; color: #DC2626; margin-top: 8px;">¡Toca para escuchar!</div>
          </div>
          <div class="animals-row" id="sound-options"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    const soundBox = this.container.querySelector('#sound-box');
    soundBox?.addEventListener('click', () => {
      this.playSound();
    });

    setTimeout(() => {
      this.ximenita?.narrate('¡Toca la caja musical mágica y adivina qué animalito canta!');
    }, 350);
  }

  private playSound(): void {
    audioService.playAnimalVocal(this.currentAnimal.vocalId);
    this.ximenita?.narrate(`¡El sonido dice: ${this.currentAnimal.onomatopoeia}!`);
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

    this.currentAnimal = SOUND_ANIMALS[(this.currentRound - 1) % SOUND_ANIMALS.length];

    const row = this.container.querySelector('#sound-options') as HTMLElement;
    row.innerHTML = '';

    SOUND_ANIMALS.forEach((item) => {
      const btn = new BigButton({
        icon: item.emoji,
        text: item.name,
        color: 'sky',
        ariaLabel: `Animal ${item.name}`,
        onClick: () => this.handlePick(item.name),
      });
      row.appendChild(btn.getElement());
    });

    setTimeout(() => this.playSound(), 500);
  }

  private handlePick(chosenName: string): void {
    if (chosenName === this.currentAnimal.name) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien!');

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1800);
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Vamos, tú puedes! ¡Inténtalo de nuevo!');
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
      skillWorked: 'Discriminación auditiva fonológica y relación con fauna',
      area: this.config.area,
    });
  }
}
