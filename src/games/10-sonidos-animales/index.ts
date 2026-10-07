import { audioService } from '../../core/audioService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

interface SoundAnimalItem {
  id: string;
  name: string;
  emoji: string;
  vocalId: string;
  onomatopoeia: string;
  hint: string;
}

// Catálogo de animales con acústica inconfundible y cercana para niños de 3 a 10 años
const REALISTIC_ANIMALS: SoundAnimalItem[] = [
  { id: 'perro', name: 'Perro', emoji: '🐶', vocalId: 'perro', onomatopoeia: '¡Guau! ¡Guau!', hint: 'El mejor amigo que ladra en casa' },
  { id: 'gato', name: 'Gato', emoji: '🐱', vocalId: 'gato', onomatopoeia: '¡Miau!', hint: 'Un felino tierno y dormilón' },
  { id: 'vaca', name: 'Vaca', emoji: '🐮', vocalId: 'vaca', onomatopoeia: '¡Muuuu!', hint: 'Nos da rica leche en la granja' },
  { id: 'pato', name: 'Pato', emoji: '🦆', vocalId: 'pato', onomatopoeia: '¡Cuac! ¡Cuac!', hint: 'Nada feliz en la laguna' },
  { id: 'leon', name: 'León', emoji: '🦁', vocalId: 'leon', onomatopoeia: '¡Groaaar!', hint: 'El rey de la selva con melena' },
  { id: 'oveja', name: 'Oveja', emoji: '🐑', vocalId: 'oveja', onomatopoeia: '¡Béeee!', hint: 'Tiene lana suave y esponjosa' },
  { id: 'elefante', name: 'Elefante', emoji: '🐘', vocalId: 'elefante', onomatopoeia: '¡Fruuuuut!', hint: 'El animal más grande con trompa larga' },
  { id: 'rana', name: 'Rana', emoji: '🐸', vocalId: 'rana', onomatopoeia: '¡Croac! ¡Croac!', hint: 'Salta de hoja en hoja en el charco' },
  { id: 'mono', name: 'Mono', emoji: '🐒', vocalId: 'mono', onomatopoeia: '¡Uh-uh! ¡Ah-ah!', hint: 'Hace piruetas en las ramas' },
  { id: 'gallo', name: 'Gallo', emoji: '🐓', vocalId: 'gallo', onomatopoeia: '¡Ki-ki-ri-kí!', hint: 'Canta al amanecer' },
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
  private currentAnimal: SoundAnimalItem = REALISTIC_ANIMALS[0];
  private currentOptions: SoundAnimalItem[] = [];
  private isProcessing: boolean = false;
  private audioTimeoutId: any = null;

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.isProcessing = false;
    this.ximenita = new XimenitaComponent('magician');

    this.renderShell();
    this.startRound();
  }

  public unmount(): void {
    if (this.audioTimeoutId) {
      clearTimeout(this.audioTimeoutId);
      this.audioTimeoutId = null;
    }
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
          <p class="game-sub-instruction">Escucha el sonido del animalito y toca la tarjeta correcta</p>
        </div>

        <div class="sonidos-stage">
          <!-- Caja Musical Mágica Interactiva -->
          <button class="sound-box" id="sound-box" aria-label="Tocar para escuchar el sonido del animal">
            <div class="sound-box-speaker">🔊</div>
            <div class="sound-box-caption">
              <span class="caption-title">¡Toca para escuchar el sonido!</span>
              <span class="caption-hint" id="caption-hint">🎶 ¿Qué animalito canta?</span>
            </div>
          </button>

          <!-- Opciones de animales para elegir -->
          <div class="animal-cards-grid" id="sound-options" role="region" aria-label="Opciones de animales"></div>
        </div>

        <!-- Área de Ximenita -->
        <div id="game-ximenita-slot" class="ximenita-game-anchor"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    const soundBox = this.container.querySelector('#sound-box');
    soundBox?.addEventListener('click', () => {
      this.playAnimalSoundOnly();
    });

    // Saludo inicial de Ximenita
    setTimeout(() => {
      this.ximenita?.narrate('¡Abre bien las orejitas! Escucha el sonido y adivina qué animalito es.');
    }, 400);
  }

  // Reproduce exclusivamente la acústica realista del animal sin solapamiento de voz
  private playAnimalSoundOnly(): void {
    const box = this.container?.querySelector('#sound-box');
    box?.classList.add('playing-sound');
    audioService.playAnimalVocal(this.currentAnimal.vocalId);

    const hintEl = this.container?.querySelector('#caption-hint');
    if (hintEl) {
      hintEl.textContent = `Escuchando: ${this.currentAnimal.onomatopoeia}`;
    }

    setTimeout(() => {
      box?.classList.remove('playing-sound');
    }, 1200);
  }

  private startRound(): void {
    if (!this.container) return;
    this.currentRound++;
    this.isProcessing = false;

    if (this.currentRound > this.config.rounds) {
      this.finishGame();
      return;
    }

    const roundNumEl = this.container.querySelector('#round-num');
    if (roundNumEl) roundNumEl.textContent = this.currentRound.toString();

    // 1. Seleccionar el animal de esta ronda (secuencial o variado)
    this.currentAnimal = REALISTIC_ANIMALS[(this.currentRound - 1) % REALISTIC_ANIMALS.length];

    // 2. Determinar distractores (3 opciones en nivel 1-2, 4 opciones en nivel 3-5)
    const level = this.difficulty.getLevel();
    const optionsCount = level >= 3 ? 4 : 3;

    const distractors = REALISTIC_ANIMALS.filter((a) => a.id !== this.currentAnimal.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, optionsCount - 1);

    this.currentOptions = [this.currentAnimal, ...distractors].sort(() => Math.random() - 0.5);

    // 3. Renderizar las tarjetas de opciones
    const row = this.container.querySelector('#sound-options') as HTMLElement;
    if (row) {
      row.innerHTML = '';
      this.currentOptions.forEach((item) => {
        const card = document.createElement('button');
        card.className = 'animal-choice-card';
        card.setAttribute('data-id', item.id);
        card.setAttribute('aria-label', `Elegir animal ${item.name}`);
        card.innerHTML = `
          <div class="animal-choice-emoji">${item.emoji}</div>
          <div class="animal-choice-name">${item.name}</div>
          <div class="animal-choice-sound">${item.onomatopoeia}</div>
        `;

        card.addEventListener('click', () => this.handlePick(item, card));
        row.appendChild(card);
      });
    }

    // 4. Reproducir el sonido automáticamente tras breve pausa para que el niño lo escuche limpio
    if (this.audioTimeoutId) clearTimeout(this.audioTimeoutId);
    this.audioTimeoutId = setTimeout(() => {
      this.playAnimalSoundOnly();
    }, 700);
  }

  private handlePick(chosenItem: SoundAnimalItem, cardEl: HTMLElement): void {
    if (this.isProcessing) return;

    if (chosenItem.id === this.currentAnimal.id) {
      // ¡ACIERTO!
      this.isProcessing = true;
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();

      // Efectos visuales y sonoros
      cardEl.classList.add('card-correct');
      audioService.playAnimalVocal(this.currentAnimal.vocalId);

      // Ximenita celebra con frase entusiasta
      this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien!');

      if (levelChanged) {
        setTimeout(() => this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`), 1300);
      }

      setTimeout(() => {
        this.startRound();
      }, 2000);
    } else {
      // INTENTO INCORRECTO: Pista amigable sin castigo
      this.misses++;
      this.difficulty.recordMiss();

      audioService.playGentleHint();
      cardEl.classList.add('card-shake');
      setTimeout(() => cardEl.classList.remove('card-shake'), 600);
      cardEl.style.opacity = '0.45';

      // Ximenita anima con voz cálida
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
      skillWorked: 'Discriminación auditiva fonológica y reconocimiento de fauna',
      area: this.config.area,
    });
  }
}
