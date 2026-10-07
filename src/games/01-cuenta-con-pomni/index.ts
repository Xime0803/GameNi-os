import { audioService } from '../../core/audioService';
import { speechService } from '../../core/speechService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { BigButton } from '../../ui/BigButton';
import { XimenitaComponent } from '../../ui/Ximenita';
import { config } from './config';
import './styles.css';

export class CuentaConPomniGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;
  private currentCount: number = 0;
  private itemsCountedByUser: Set<number> = new Set();

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
      <div class="pomni-game">
        <div class="game-header-info">
          <h2>🍌 Cuenta con Pomni (Ronda <span id="round-num">1</span>/8)</h2>
        </div>
        <div class="pomni-stage">
          <div class="pomni-speech-bubble" style="background: #FFF; padding: 12px 20px; border-radius: 20px; border: 3px solid #00C4B4; font-size: 20px; font-weight: 700; color: #00877A;">
            🐒 Pomni dice: "¡Ayúdame a contar los plátanos para mi show!"
          </div>
          <div class="pomni-items-box" id="items-box"></div>
          <div class="pomni-options" id="options-box"></div>
        </div>
        <div id="game-ximenita-slot" style="align-self: flex-start; margin-left: 24px;"></div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    // Pomni emite su chillido amistoso y Ximenita narra la consigna
    audioService.playAnimalVocal('pomni');
    setTimeout(() => {
      this.ximenita?.narrate('¡Toca los plátanos para contarlos y elige cuántos hay en total!');
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

    // Rango según nivel adaptativo (Nivel 1: 1 a 5, Nivel 2: 1 a 10, Nivel 3: 10 a 20, Nivel 4: 20 a 50, Nivel 5: 50 a 100)
    const level = this.difficulty.getLevel();
    let min = 1;
    let max = 5;
    if (level === 2) { min = 3; max = 10; }
    else if (level === 3) { min = 8; max = 15; }
    else if (level === 4) { min = 12; max = 25; }
    else if (level === 5) { min = 20; max = 40; }

    this.currentCount = Math.floor(Math.random() * (max - min + 1)) + min;
    this.itemsCountedByUser.clear();

    // Renderizar elementos
    const itemsBox = this.container.querySelector('#items-box') as HTMLElement;
    itemsBox.innerHTML = '';

    for (let i = 0; i < this.currentCount; i++) {
      const item = document.createElement('div');
      item.className = 'count-item pulse-gentle';
      item.textContent = '🍌';
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Plátano número ${i + 1}`);

      const onCountBanana = (e: Event) => {
        e.preventDefault();
        if (!this.itemsCountedByUser.has(i)) {
          this.itemsCountedByUser.add(i);
          const currentCount = this.itemsCountedByUser.size;
          item.classList.add('counted');
          item.classList.remove('pulse-gentle');

          // 1. Tono musical instantáneo marimba a 0ms de latencia
          audioService.playNumberTone(currentCount);

          // 2. Insignia visual con el número que flota sobre el plátano
          const badge = document.createElement('span');
          badge.className = 'count-number-badge';
          badge.textContent = `${currentCount}`;
          item.appendChild(badge);

          // 3. Pronunciación fonética inmediata y veloz ("¡Uno!", "¡Dos!")
          speechService.speakNumber(currentCount);
        }
      };

      item.addEventListener('pointerdown', onCountBanana);
      itemsBox.appendChild(item);
    }

    // Generar 3 opciones (la correcta y dos distractores cercanos)
    const options = this.generateOptions(this.currentCount);
    const optionsBox = this.container.querySelector('#options-box') as HTMLElement;
    optionsBox.innerHTML = '';

    options.forEach((opt) => {
      const btn = new BigButton({
        text: opt.toString(),
        color: 'sun',
        ariaLabel: `Opción ${opt}`,
        onClick: () => {
          audioService.playNumberTone(opt);
          this.handleOptionChoice(opt);
        },
      });
      optionsBox.appendChild(btn.getElement());
    });
  }

  private generateOptions(correct: number): number[] {
    const opts = new Set<number>([correct]);
    while (opts.size < 3) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const val = Math.max(1, correct + delta);
      opts.add(val);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  }

  private handleOptionChoice(chosen: number): void {
    if (chosen === this.currentCount) {
      // ¡Acierto!
      this.hits++;
      const { levelChanged, newLevel } = this.difficulty.recordHit();
      audioService.playSuccess();
      this.ximenita?.celebrate('¡Excelente, lo hiciste muy bien!');

      if (levelChanged) {
        setTimeout(() => {
          this.ximenita?.narrate(`¡Subiste al nivel ${newLevel}!`);
        }, 1200);
      }

      setTimeout(() => this.startRound(), 1800);
    } else {
      // Error amigable: pista y reintentar
      this.misses++;
      this.difficulty.recordMiss();
      audioService.playGentleHint();
      this.ximenita?.giveHint('¡Vamos, tú puedes! ¡Inténtalo de nuevo!');
    }
  }

  private finishGame(): void {
    if (!this.onComplete) return;
    const timeSpent = Date.now() - this.startTime;
    this.onComplete({
      gameId: this.config.id,
      finalLevel: this.difficulty.getLevel(),
      hits: this.hits,
      misses: this.misses,
      timeSpentMs: timeSpent,
      skillWorked: 'Conteo y correspondencia término a término del 1 al 100',
      area: this.config.area,
    });
  }
}
