import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

interface HabitatQuestion {
  animal: string;
  name: string;
  correctHabitat: 'Selva' | 'Mar' | 'Montaña';
}

const QUESTIONS: HabitatQuestion[] = [
  { animal: '🦜', name: 'Guacamayo', correctHabitat: 'Selva' },
  { animal: '🐬', name: 'Delfín', correctHabitat: 'Mar' },
  { animal: '🦙', name: 'Vicuña', correctHabitat: 'Montaña' },
  { animal: '🐒', name: 'Monito titi', correctHabitat: 'Selva' },
  { animal: '🐢', name: 'Tortuga marina', correctHabitat: 'Mar' },
  { animal: '🦅', name: 'Cóndor andino', correctHabitat: 'Montaña' },
];

export class DondeViveGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private currentQuestion: HabitatQuestion = QUESTIONS[0];

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
      <div class="habitat-game">
        <div class="game-header-info">
          <h2>🏞️ ¿Dónde vive? (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="habitat-stage">
          <div class="habitat-animal-box">
            <span id="hab-emoji">🦜</span>
            <div id="hab-name" style="font-size: 26px; font-weight: 800; color: #166534; margin-top: 8px;">Guacamayo</div>
          </div>
          <div class="habitats-row" id="habitats-options"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    setTimeout(() => {
      this.ximenita?.narrate('¿Dónde vive este amiguito? ¿En la selva, en el mar o en la montaña?');
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

    this.currentQuestion = QUESTIONS[(this.currentRound - 1) % QUESTIONS.length];

    const emojiEl = this.container.querySelector('#hab-emoji');
    const nameEl = this.container.querySelector('#hab-name');
    if (emojiEl) emojiEl.textContent = this.currentQuestion.animal;
    if (nameEl) nameEl.textContent = this.currentQuestion.name;

    const row = this.container.querySelector('#habitats-options') as HTMLElement;
    row.innerHTML = '';

    const habitats = [
      { id: 'Selva', label: '🌴 Selva', color: 'leaf' },
      { id: 'Mar', label: '🌊 Mar', color: 'sky' },
      { id: 'Montaña', label: '🏔️ Montaña', color: 'sun' },
    ];

    habitats.forEach((hab) => {
      const btn = new BigButton({
        text: hab.label,
        color: hab.color as any,
        ariaLabel: `Hábitat ${hab.id}`,
        onClick: () => this.handlePick(hab.id),
      });
      row.appendChild(btn.getElement());
    });

    this.ximenita?.narrate(`¿Dónde vive el ${this.currentQuestion.name}?`);
  }

  private handlePick(chosen: string): void {
    if (chosen === this.currentQuestion.correctHabitat) {
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate(`¡Sí! ¡El ${this.currentQuestion.name} vive en la ${chosen}!`);

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1200);
      }
      setTimeout(() => this.startRound(), 1500);
    } else {
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('Casi. Piensa en el clima y los árboles donde suele estar.');
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
      skillWorked: 'Clasificación de hábitats y biodiversidad natural',
      area: this.config.area,
    });
  }
}
