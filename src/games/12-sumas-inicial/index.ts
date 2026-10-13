import { audioService } from '../../core/audioService';
import { speechService } from '../../core/speechService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { XimenitaComponent } from '../../ui/Ximenita';
import { numberToSpanishWord } from '../../core/numberWords';
import { config } from './config';
import './styles.css';

interface SumRoundDef {
  a: number;
  b: number;
  emoji: string;
  nameSingle: string;
  namePlural: string;
}

export class SumasInicialGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;

  private currentOpA: number = 1;
  private currentOpB: number = 1;
  private currentEmoji: string = '🍎';
  private currentPlural: string = 'manzanas';
  private itemsCounted: Set<number> = new Set();
  private countSequence: number = 0;

  private readonly roundsCatalog: SumRoundDef[] = [
    { a: 1, b: 1, emoji: '🍎', nameSingle: 'manzanita', namePlural: 'manzanitas' },
    { a: 2, b: 1, emoji: '🦆', nameSingle: 'patito', namePlural: 'patitos' },
    { a: 1, b: 2, emoji: '⭐️', nameSingle: 'estrellita', namePlural: 'estrellitas' },
    { a: 2, b: 2, emoji: '🧸', nameSingle: 'osito', namePlural: 'ositos' },
    { a: 3, b: 1, emoji: '🥕', nameSingle: 'zanahoria', namePlural: 'zanahorias' },
    { a: 3, b: 2, emoji: '🍓', nameSingle: 'fresita', namePlural: 'fresitas' },
  ];

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
    this.itemsCounted.clear();
  }

  private renderShell(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="sumas-inicial-game">
        <div class="sumas-inicial-header">
          <h2>🐣 Primeras Sumas (Ronda <span id="round-num">1</span>/${this.config.rounds})</h2>
          <div class="sumas-inicial-speech">
            🐻 Kaufmo dice: "¡Juntemos los objetos en la gran canastita!"
          </div>
        </div>

        <div class="sumas-baskets-stage" id="sumas-stage">
          <!-- Canasta A -->
          <div class="sumas-basket" id="basket-a">
            <span class="sumas-basket-label">Canasta 1</span>
            <div class="sumas-basket-items" id="items-a"></div>
          </div>

          <!-- Operador Juntar (+) -->
          <div class="sumas-operator">
            <div class="operator-badge">+</div>
            <span class="operator-word">Juntamos</span>
          </div>

          <!-- Canasta B -->
          <div class="sumas-basket" id="basket-b">
            <span class="sumas-basket-label">Canasta 2</span>
            <div class="sumas-basket-items" id="items-b"></div>
          </div>

          <!-- Operador Igual (=) -->
          <div class="sumas-operator">
            <div class="operator-badge" style="background: #10B981;">=</div>
            <span class="operator-word">Total</span>
          </div>

          <!-- Canasta de Resultado -->
          <div class="goal-basket" id="goal-basket">
            <span class="goal-basket-label">Juntos</span>
            <div class="goal-basket-mystery" id="goal-content">❓</div>
          </div>
        </div>

        <!-- Opciones de respuesta -->
        <div class="sumas-options-container">
          <p class="sumas-prompt-text" id="prompt-text">
            ¿Cuántos hay en total si los juntamos todos?
          </p>
          <div class="sumas-options-row" id="sum-options-row"></div>
        </div>

        <!-- Footer / Ximenita -->
        <div class="sumas-inicial-footer">
          <div id="game-ximenita-slot"></div>
        </div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    // Saludo inicial pedagógico
    setTimeout(() => {
      this.ximenita?.narrate('¡Toca los dibujitos para contarlos uno por uno y averigua cuántos hay juntos!');
    }, 400);
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

    // Reset de conteo táctil
    this.itemsCounted.clear();
    this.countSequence = 0;

    // Resetear canasta de meta
    const goalContent = this.container.querySelector('#goal-content') as HTMLElement;
    const goalBasket = this.container.querySelector('#goal-basket') as HTMLElement;
    if (goalContent) {
      goalContent.innerHTML = '❓';
      goalContent.className = 'goal-basket-mystery';
    }
    if (goalBasket) {
      goalBasket.classList.remove('basket-celebrating');
    }

    // Seleccionar suma para esta ronda
    const roundDef = this.roundsCatalog[(this.currentRound - 1) % this.roundsCatalog.length];
    this.currentOpA = roundDef.a;
    this.currentOpB = roundDef.b;
    this.currentEmoji = roundDef.emoji;
    this.currentPlural = roundDef.namePlural;

    this.renderBaskets();
    this.renderOptions();

    // Narra la consigna de forma cálida para niños pequeños
    setTimeout(() => {
      this.ximenita?.narrate(
        `Tenemos ${this.currentOpA} y agregamos ${this.currentOpB} más. ¡Tócalos para contarlos y elige cuántos hay en total!`
      );
    }, 350);
  }

  private renderBaskets(): void {
    if (!this.container) return;

    const itemsAContainer = this.container.querySelector('#items-a') as HTMLElement;
    const itemsBContainer = this.container.querySelector('#items-b') as HTMLElement;
    if (!itemsAContainer || !itemsBContainer) return;

    itemsAContainer.innerHTML = '';
    itemsBContainer.innerHTML = '';

    let itemGlobalId = 0;

    // Renderizar Canasta A
    for (let i = 0; i < this.currentOpA; i++) {
      const id = itemGlobalId++;
      const el = this.createTangibleItem(id);
      itemsAContainer.appendChild(el);
    }

    // Renderizar Canasta B
    for (let i = 0; i < this.currentOpB; i++) {
      const id = itemGlobalId++;
      const el = this.createTangibleItem(id);
      itemsBContainer.appendChild(el);
    }
  }

  private createTangibleItem(itemId: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'tangible-item';
    item.textContent = this.currentEmoji;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Tocar para contar ${this.currentPlural}`);

    item.addEventListener('pointerdown', (e: Event) => {
      e.preventDefault();
      if (!this.itemsCounted.has(itemId)) {
        this.itemsCounted.add(itemId);
        this.countSequence++;
        const currentCount = this.countSequence;

        item.classList.add('counted');

        // Insignia visual con el número que brota al tocar
        const badge = document.createElement('span');
        badge.className = 'item-count-badge';
        badge.textContent = `${currentCount}`;
        item.appendChild(badge);

        // Sonido de marimba inmediato a 0ms de latencia
        audioService.playNumberTone(currentCount);

        // Pronunciación de voz fonética instantánea ("¡Uno!", "¡Dos!")
        speechService.speakNumber(currentCount);
      }
    });

    return item;
  }

  private renderOptions(): void {
    if (!this.container) return;

    const optionsRow = this.container.querySelector('#sum-options-row') as HTMLElement;
    if (!optionsRow) return;

    optionsRow.innerHTML = '';

    const correctSum = this.currentOpA + this.currentOpB;
    const options = this.generateOptions(correctSum);

    const colors = ['#3B82F6', '#10B981', '#F59E0B'];

    options.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = 'sum-option-card';
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Opción ${opt}`);

      // Generar puntos táctiles visuales correspondientes para que los niños de 3 años puedan contar los puntos
      const dotsHtml = Array.from({ length: opt })
        .map(() => `<span class="sum-opt-dot">${this.currentEmoji}</span>`)
        .join('');

      card.innerHTML = `
        <span class="sum-opt-number" style="color: ${colors[idx % colors.length]}">${opt}</span>
        <div class="sum-opt-dots">
          ${dotsHtml}
        </div>
      `;

      card.addEventListener('pointerdown', (e: Event) => {
        e.preventDefault();
        this.handleAnswerChoice(opt, correctSum);
      });

      optionsRow.appendChild(card);
    });
  }

  private generateOptions(correct: number): number[] {
    const opts = new Set<number>([correct]);
    // Generar distractores válidos para edad preescolar (1 a 5)
    const pool = [1, 2, 3, 4, 5].filter((n) => n !== correct);
    pool.sort(() => Math.random() - 0.5);

    for (const n of pool) {
      opts.add(n);
      if (opts.size >= 3) break;
    }

    return Array.from(opts).sort(() => Math.random() - 0.5);
  }

  private handleAnswerChoice(chosen: number, correct: number): void {
    if (chosen === correct) {
      // ¡Acierto!
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();

      // Animación de unión: los objetos se juntan en la gran canasta
      const goalContent = this.container?.querySelector('#goal-content') as HTMLElement;
      const goalBasket = this.container?.querySelector('#goal-basket') as HTMLElement;

      if (goalContent && goalBasket) {
        goalBasket.classList.add('basket-celebrating');
        goalContent.className = 'sumas-basket-items';
        goalContent.innerHTML = Array.from({ length: correct })
          .map(() => `<span class="tangible-item" style="font-size: 2.2rem;">${this.currentEmoji}</span>`)
          .join('');
      }

      audioService.playSuccess();
      speechService.speakNumber(correct);

      const aWord = numberToSpanishWord(this.currentOpA);
      const bWord = numberToSpanishWord(this.currentOpB);
      const sumWord = numberToSpanishWord(correct);

      setTimeout(() => {
        this.ximenita?.celebrate(`¡Excelente! ¡${aWord} y ${bWord} son ${sumWord} ${this.currentPlural}!`);
      }, 350);

      if (levelChanged) {
        setTimeout(() => {
          this.ximenita?.narrate(`¡Avanzaste al nivel ${newLevel}!`);
        }, 1200);
      }

      setTimeout(() => this.startRound(), 2000);
    } else {
      // Error amigable sin castigo: pista táctil
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Casi! Toca cada dibujito para contarlos todos.');
    }
  }

  private finishGame(): void {
    if (!this.onComplete) return;
    const timeSpent = Date.now() - this.startTime;
    audioService.playCheer();

    this.onComplete({
      gameId: this.config.id,
      finalLevel: this.difficulty.getLevel(),
      hits: this.hits,
      misses: this.misses,
      timeSpentMs: timeSpent,
      skillWorked: 'Resolución de problemas de cantidad y unión concreta de colecciones hasta 5',
      area: this.config.area,
    });
  }
}
