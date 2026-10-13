import { audioService } from '../../core/audioService';
import { speechService } from '../../core/speechService';
import { DifficultyService } from '../../core/difficultyService';
import { MiniGame, MiniGameConfig, MiniGameSessionResult } from '../../core/types';
import { XimenitaComponent } from '../../ui/Ximenita';
import { numberToSpanishWord } from '../../core/numberWords';
import { config } from './config';
import './styles.css';

interface PairItem {
  number: number;
  emoji: string;
  name: string;
}

interface ActiveDrag {
  startSide: 'left' | 'right';
  itemNumber: number;
  startX: number;
  startY: number;
  lineEl: SVGPathElement;
  pointerId: number;
}

interface LockedLine {
  itemNumber: number;
  leftCard: HTMLElement;
  rightCard: HTMLElement;
  pathEl: SVGPathElement;
}

export class ConectaNumerosGame implements MiniGame {
  public readonly config: MiniGameConfig = config;
  private container: HTMLElement | null = null;
  private onComplete: ((result: MiniGameSessionResult) => void) | null = null;
  private difficulty: DifficultyService = new DifficultyService(1);
  private ximenita: XimenitaComponent | null = null;

  private currentRound: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private startTime: number = 0;

  private currentPairs: PairItem[] = [];
  private connectedNumbers: Set<number> = new Set();
  private lockedLines: LockedLine[] = [];

  private activeDrag: ActiveDrag | null = null;
  private selectedTapCard: { side: 'left' | 'right'; itemNumber: number; el: HTMLElement } | null = null;
  private resizeHandler: (() => void) | null = null;

  public mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentRound = 0;
    this.hits = 0;
    this.misses = 0;
    this.startTime = Date.now();
    this.ximenita = new XimenitaComponent('default');

    this.renderShell();

    this.resizeHandler = () => this.redrawLockedLines();
    window.addEventListener('resize', this.resizeHandler);

    this.startRound();
  }

  public unmount(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.ximenita) {
      this.ximenita.destroy();
      this.ximenita = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    this.activeDrag = null;
    this.selectedTapCard = null;
    this.lockedLines = [];
  }

  private renderShell(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="conecta-game">
        <div class="conecta-header">
          <h2>🔗 Une Números y Dibujos (Ronda <span id="round-num">1</span>/${this.config.rounds})</h2>
          <div class="conecta-speech-bubble">
            🐢 Bubble dice: "¡Une con tu dedito cada número con sus dibujitos!"
          </div>
        </div>

        <div class="conecta-stage" id="conecta-stage">
          <svg class="conecta-svg-overlay" id="conecta-svg" xmlns="http://www.w3.org/2000/svg"></svg>
          <div class="conecta-column" id="left-column"></div>
          <div class="conecta-column" id="right-column"></div>
        </div>

        <div class="conecta-footer">
          <div id="game-ximenita-slot"></div>
        </div>
      </div>
    `;

    const slot = this.container.querySelector('#game-ximenita-slot');
    if (slot && this.ximenita) {
      slot.appendChild(this.ximenita.getElement());
    }

    // Saludo amigable inicial
    setTimeout(() => {
      this.ximenita?.narrate('¡Traza una línea con tu dedo o toca una tarjeta para unir cada número con su cantidad!');
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

    this.connectedNumbers.clear();
    this.lockedLines = [];
    this.activeDrag = null;
    this.selectedTapCard = null;

    const svg = this.container.querySelector('#conecta-svg') as SVGSVGElement;
    if (svg) svg.innerHTML = '';

    // Generar pares temáticos adaptados a infantes de 3 a 5 años
    this.currentPairs = this.getPairsForRound(this.currentRound);

    this.renderCards();
  }

  private getPairsForRound(round: number): PairItem[] {
    if (round === 1) {
      // 3 números: 1, 2, 3
      return [
        { number: 1, emoji: '🐢', name: 'tortuga' },
        { number: 2, emoji: '🦆', name: 'patitos' },
        { number: 3, emoji: '🐸', name: 'ranitas' },
      ];
    } else if (round === 2) {
      // 3 números: 2, 3, 4
      return [
        { number: 2, emoji: '🍎', name: 'manzanitas' },
        { number: 3, emoji: '🍌', name: 'plátanos' },
        { number: 4, emoji: '🍓', name: 'fresas' },
      ];
    } else if (round === 3) {
      // 4 números: 1, 2, 3, 4
      return [
        { number: 1, emoji: '🧸', name: 'osito' },
        { number: 2, emoji: '🚗', name: 'carritos' },
        { number: 3, emoji: '🎈', name: 'globos' },
        { number: 4, emoji: '⭐️', name: 'estrellitas' },
      ];
    } else {
      // 4 números: 2, 3, 4, 5
      return [
        { number: 2, emoji: '🌸', name: 'flores' },
        { number: 3, emoji: '🐝', name: 'abejitas' },
        { number: 4, emoji: '🥕', name: 'zanahorias' },
        { number: 5, emoji: '🐟', name: 'pececitos' },
      ];
    }
  }

  private renderCards(): void {
    if (!this.container) return;

    const leftCol = this.container.querySelector('#left-column') as HTMLElement;
    const rightCol = this.container.querySelector('#right-column') as HTMLElement;
    if (!leftCol || !rightCol) return;

    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    // Columna Izquierda: Números barajados
    const shuffledNumbers = [...this.currentPairs].sort(() => Math.random() - 0.5);
    // Columna Derecha: Dibujos barajados
    const shuffledDrawings = [...this.currentPairs].sort(() => Math.random() - 0.5);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

    // Renderizar tarjetas de números
    shuffledNumbers.forEach((pair) => {
      const color = colors[(pair.number - 1) % colors.length];
      const card = document.createElement('div');
      card.className = 'conecta-card number-card';
      card.dataset.side = 'left';
      card.dataset.num = pair.number.toString();
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Número ${pair.number}, palabra ${numberToSpanishWord(pair.number)}`);

      card.innerHTML = `
        <div class="number-card-badge" style="background-color: ${color}">
          ${pair.number}
        </div>
        <div class="number-card-text">
          <span class="number-card-word">${numberToSpanishWord(pair.number)}</span>
          <span class="number-card-sub">número</span>
        </div>
        <div class="conecta-anchor-dot"></div>
      `;

      this.attachCardInteractions(card, 'left', pair.number);
      leftCol.appendChild(card);
    });

    // Renderizar tarjetas de dibujos
    shuffledDrawings.forEach((pair) => {
      const card = document.createElement('div');
      card.className = 'conecta-card drawing-card';
      card.dataset.side = 'right';
      card.dataset.num = pair.number.toString();
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${pair.number} ${pair.name}`);

      const itemsHtml = Array.from({ length: pair.number })
        .map(() => `<span class="drawing-card-item">${pair.emoji}</span>`)
        .join('');

      card.innerHTML = `
        <div class="conecta-anchor-dot"></div>
        <div class="drawing-card-items">
          ${itemsHtml}
        </div>
        <span class="drawing-card-check">✓</span>
      `;

      this.attachCardInteractions(card, 'right', pair.number);
      rightCol.appendChild(card);
    });
  }

  private attachCardInteractions(card: HTMLElement, side: 'left' | 'right', itemNumber: number): void {
    const stage = this.container?.querySelector('#conecta-stage') as HTMLElement;
    const svg = this.container?.querySelector('#conecta-svg') as SVGSVGElement;
    if (!stage || !svg) return;

    // 1. Gesto Táctil de Arrastre (Pointer Drag)
    card.addEventListener('pointerdown', (e: PointerEvent) => {
      if (this.connectedNumbers.has(itemNumber)) return;
      e.preventDefault();

      // Sonido de inicio suave
      audioService.playClick();
      card.setPointerCapture(e.pointerId);

      const anchor = card.querySelector('.conecta-anchor-dot') as HTMLElement;
      const anchorPos = this.getAnchorCenter(anchor, stage);

      // Crear elemento de línea activa en el SVG
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'conecta-active-line');
      svg.appendChild(path);

      this.activeDrag = {
        startSide: side,
        itemNumber,
        startX: anchorPos.x,
        startY: anchorPos.y,
        lineEl: path,
        pointerId: e.pointerId,
      };

      // Si había una tarjeta seleccionada por toque previo, deseleccionarla
      this.clearTapSelection();
    });

    card.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.activeDrag || this.activeDrag.pointerId !== e.pointerId) return;
      e.preventDefault();

      const stageRect = stage.getBoundingClientRect();
      const currentX = e.clientX - stageRect.left;
      const currentY = e.clientY - stageRect.top;

      const pathData = this.calculateBezierPath(
        this.activeDrag.startX,
        this.activeDrag.startY,
        currentX,
        currentY,
        this.activeDrag.startSide
      );
      this.activeDrag.lineEl.setAttribute('d', pathData);
    });

    const finishPointer = (e: PointerEvent) => {
      if (!this.activeDrag || this.activeDrag.pointerId !== e.pointerId) return;
      e.preventDefault();

      try {
        card.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback si ya fue liberado
      }

      // Averiguar sobre qué tarjeta se soltó el dedito
      const targetEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const targetCard = targetEl?.closest('.conecta-card') as HTMLElement | null;

      const dragged = this.activeDrag;
      this.activeDrag = null;

      if (targetCard && !targetCard.classList.contains('locked')) {
        const targetSide = targetCard.dataset.side as 'left' | 'right';
        const targetNum = parseInt(targetCard.dataset.num || '0', 10);

        // Debe ser del lado opuesto
        if (targetSide !== dragged.startSide) {
          if (targetNum === dragged.itemNumber) {
            // ¡Conexión Correcta!
            this.handleSuccessMatch(dragged.itemNumber, card, targetCard, dragged.lineEl);
            return;
          } else {
            // Conexión incorrecta
            this.handleMismatch(dragged.lineEl);
            return;
          }
        }
      }

      // Si no cayó en una tarjeta válida, remover línea suavemente
      dragged.lineEl.remove();

      // 2. Soporte de Tap-to-Pair (Toque para infantes pequeños)
      // Si el usuario simplemente hizo un toque corto en la tarjeta sin arrastrar mucho
      this.handleCardTap(card, side, itemNumber);
    };

    card.addEventListener('pointerup', finishPointer);
    card.addEventListener('pointercancel', finishPointer);
  }

  private handleCardTap(card: HTMLElement, side: 'left' | 'right', itemNumber: number): void {
    if (this.connectedNumbers.has(itemNumber)) return;

    if (!this.selectedTapCard) {
      // Primer toque: seleccionar esta tarjeta
      this.selectedTapCard = { side, itemNumber, el: card };
      card.classList.add('selected');
      audioService.playNumberTone(itemNumber);
      speechService.speakNumber(itemNumber);
    } else if (this.selectedTapCard.side === side) {
      // Toque en el mismo lado: cambiar selección
      this.selectedTapCard.el.classList.remove('selected');
      this.selectedTapCard = { side, itemNumber, el: card };
      card.classList.add('selected');
      audioService.playNumberTone(itemNumber);
    } else {
      // Toque en el lado opuesto: intentar emparejar
      const first = this.selectedTapCard;
      this.clearTapSelection();

      if (first.itemNumber === itemNumber) {
        // ¡Emparejamiento correcto por toque!
        const leftCard = first.side === 'left' ? first.el : card;
        const rightCard = first.side === 'right' ? first.el : card;
        this.handleSuccessMatch(itemNumber, leftCard, rightCard, null);
      } else {
        // No coinciden
        audioService.playGentleHint();
        this.misses++;
        this.difficulty.recordMiss();
        this.ximenita?.giveHint('¡Casi! Cuenta los dibujitos despacio.');
      }
    }
  }

  private clearTapSelection(): void {
    if (this.selectedTapCard) {
      this.selectedTapCard.el.classList.remove('selected');
      this.selectedTapCard = null;
    }
  }

  private handleSuccessMatch(
    itemNumber: number,
    cardA: HTMLElement,
    cardB: HTMLElement,
    existingActiveLine: SVGPathElement | null
  ): void {
    const leftCard = (cardA.dataset.side === 'left' ? cardA : cardB) as HTMLElement;
    const rightCard = (cardA.dataset.side === 'right' ? cardA : cardB) as HTMLElement;

    this.connectedNumbers.add(itemNumber);
    leftCard.classList.add('locked');
    rightCard.classList.add('locked');
    leftCard.classList.remove('selected');
    rightCard.classList.remove('selected');

    // Remover línea activa si existía
    if (existingActiveLine) {
      existingActiveLine.remove();
    }

    // Dibujar línea fija y bloqueada
    const stage = this.container?.querySelector('#conecta-stage') as HTMLElement;
    const svg = this.container?.querySelector('#conecta-svg') as SVGSVGElement;
    if (stage && svg) {
      const anchorLeft = leftCard.querySelector('.conecta-anchor-dot') as HTMLElement;
      const anchorRight = rightCard.querySelector('.conecta-anchor-dot') as HTMLElement;
      const p1 = this.getAnchorCenter(anchorLeft, stage);
      const p2 = this.getAnchorCenter(anchorRight, stage);

      const lockedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      lockedPath.setAttribute('class', 'conecta-locked-line');
      lockedPath.setAttribute('d', this.calculateBezierPath(p1.x, p1.y, p2.x, p2.y, 'left'));
      svg.appendChild(lockedPath);

      this.lockedLines.push({
        itemNumber,
        leftCard,
        rightCard,
        pathEl: lockedPath,
      });

      // Efecto de destellos sobre la unión
      this.spawnSparkle((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, stage);
    }

    // Audio y felicitación
    this.hits++;
    audioService.playNumberTone(itemNumber);
    speechService.speakNumber(itemNumber);

    const pairData = this.currentPairs.find((p) => p.number === itemNumber);
    const itemName = pairData?.name || 'dibujos';

    setTimeout(() => {
      this.ximenita?.narrate(`¡Muy bien! ¡${itemNumber} ${itemName}!`);
    }, 450);

    // ¿Ronda completada?
    if (this.connectedNumbers.size === this.currentPairs.length) {
      setTimeout(() => {
        audioService.playSuccess();
        this.ximenita?.celebrate('¡Excelente trabajo! ¡Uniste todas las parejas!');
        setTimeout(() => this.startRound(), 1800);
      }, 700);
    }
  }

  private handleMismatch(activeLine: SVGPathElement): void {
    this.misses++;
    this.difficulty.recordMiss();
    audioService.playGentleHint();
    this.ximenita?.giveHint('¡Casi! Cuenta los dibujitos con calma.');

    // Desvanecer la línea activa
    activeLine.style.transition = 'opacity 0.25s ease';
    activeLine.style.opacity = '0';
    setTimeout(() => activeLine.remove(), 250);
  }

  private getAnchorCenter(anchor: HTMLElement, stage: HTMLElement): { x: number; y: number } {
    const anchorRect = anchor.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    return {
      x: anchorRect.left + anchorRect.width / 2 - stageRect.left,
      y: anchorRect.top + anchorRect.height / 2 - stageRect.top,
    };
  }

  private calculateBezierPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    startSide: 'left' | 'right'
  ): string {
    const dx = Math.max(30, Math.abs(x2 - x1) * 0.45);
    const cx1 = startSide === 'left' ? x1 + dx : x1 - dx;
    const cx2 = startSide === 'left' ? x2 - dx : x2 + dx;
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
  }

  private redrawLockedLines(): void {
    const stage = this.container?.querySelector('#conecta-stage') as HTMLElement;
    if (!stage) return;

    this.lockedLines.forEach((locked) => {
      const anchorLeft = locked.leftCard.querySelector('.conecta-anchor-dot') as HTMLElement;
      const anchorRight = locked.rightCard.querySelector('.conecta-anchor-dot') as HTMLElement;
      if (anchorLeft && anchorRight) {
        const p1 = this.getAnchorCenter(anchorLeft, stage);
        const p2 = this.getAnchorCenter(anchorRight, stage);
        locked.pathEl.setAttribute('d', this.calculateBezierPath(p1.x, p1.y, p2.x, p2.y, 'left'));
      }
    });
  }

  private spawnSparkle(x: number, y: number, stage: HTMLElement): void {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-burst';
    sparkle.textContent = '✨';
    sparkle.style.left = `${x - 14}px`;
    sparkle.style.top = `${y - 14}px`;
    stage.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
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
      skillWorked: 'Asociación de cantidad y grafía del 1 al 5 mediante trazo de líneas',
      area: this.config.area,
    });
  }
}
