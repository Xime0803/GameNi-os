import { TracingGuide, TracingResult } from './types';

export class TracingService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private guide: TracingGuide | null = null;
  private samplePoints: { x: number; y: number }[] = [];
  private visitedIndices: Set<number> = new Set();
  private isDrawing: boolean = false;
  private lastX: number = -1;
  private lastY: number = -1;
  // Margen de error pedagógico infantil: 50% de cobertura es éxito rotundo para motricidad fina de 3 a 10 años
  private threshold: number = 0.50;
  private onStrokeUpdate?: (coverage: number) => void;

  constructor(canvas: HTMLCanvasElement, threshold: number = 0.50) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not supported');
    this.ctx = context;
    this.threshold = threshold;
    this.initPointerEvents();
  }

  public setGuide(guide: TracingGuide): void {
    this.guide = guide;
    this.samplePoints = this.sampleSvgPath(guide.svgPath, 50);
    this.clear();
  }

  public setOnStrokeUpdate(cb: (coverage: number) => void): void {
    this.onStrokeUpdate = cb;
  }

  public clear(): void {
    this.visitedIndices.clear();
    this.lastX = -1;
    this.lastY = -1;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundGuide();
  }

  private sampleSvgPath(pathData: string, sampleCount: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    if (typeof document === 'undefined') return points;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    document.body.appendChild(svg);

    try {
      const totalLen = path.getTotalLength();
      const step = totalLen / Math.max(1, sampleCount - 1);
      for (let i = 0; i < sampleCount; i++) {
        const pt = path.getPointAtLength(i * step);
        points.push({ x: pt.x, y: pt.y });
      }
    } catch {
      // Fallback
    } finally {
      document.body.removeChild(svg);
    }
    return points;
  }

  private drawBackgroundGuide(): void {
    if (!this.guide) return;

    const scaleX = this.canvas.width / 100;
    const scaleY = this.canvas.height / 140;

    // 1. Dibujar contorno de guía azul punteada amplia y clara
    this.ctx.save();
    this.ctx.scale(scaleX, scaleY);
    this.ctx.lineWidth = 14;
    this.ctx.strokeStyle = '#93C5FD'; // Azul cielo suave
    this.ctx.setLineDash([8, 8]);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const path2D = new Path2D(this.guide.svgPath);
    this.ctx.stroke(path2D);
    this.ctx.restore();

    // 2. Dibujar punto rojo de inicio (start dot) visible
    const startX = this.guide.startingPoint.x * scaleX;
    const startY = this.guide.startingPoint.y * scaleY;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(startX, startY, 15, 0, Math.PI * 2);
    this.ctx.fillStyle = '#EF4444'; // Rojo vivo
    this.ctx.fill();
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.stroke();

    // Brillo interior en el punto rojo
    this.ctx.beginPath();
    this.ctx.arc(startX, startY, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.restore();
  }

  private initPointerEvents(): void {
    this.canvas.style.touchAction = 'none';

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDrawing = true;
      this.canvas.setPointerCapture(e.pointerId);
      this.handlePointer(e, true);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing) return;
      this.handlePointer(e, false);
    });

    const endDrawing = (e: PointerEvent) => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.lastX = -1;
        this.lastY = -1;
        try {
          this.canvas.releasePointerCapture(e.pointerId);
        } catch {
          // Ya liberado
        }
      }
    };

    this.canvas.addEventListener('pointerup', endDrawing);
    this.canvas.addEventListener('pointercancel', endDrawing);
  }

  private handlePointer(e: PointerEvent, isStart: boolean): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Dibujar trazo continuo y suave con interpolación
    this.ctx.save();
    this.ctx.lineWidth = 18;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#FF6B6B'; // Trazo coral cálido
    this.ctx.fillStyle = '#FF6B6B';

    if (isStart || this.lastX < 0 || this.lastY < 0) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 9, 0, Math.PI * 2);
      this.ctx.fill();
      this.checkHit(x, y);
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      // Interpolación entre puntos consecutivos para no perder muestras al dibujar rápido
      const dist = Math.hypot(x - this.lastX, y - this.lastY);
      const steps = Math.max(1, Math.floor(dist / 6));
      for (let s = 1; s <= steps; s++) {
        const ix = this.lastX + ((x - this.lastX) * s) / steps;
        const iy = this.lastY + ((y - this.lastY) * s) / steps;
        this.checkHit(ix, iy);
      }
    }
    this.ctx.restore();

    this.lastX = x;
    this.lastY = y;

    const currentCoverage = this.samplePoints.length > 0
      ? this.visitedIndices.size / this.samplePoints.length
      : 0;

    if (this.onStrokeUpdate) {
      this.onStrokeUpdate(currentCoverage);
    }
  }

  // Comprueba cercanía con margen de error generoso para dedos infantiles
  private checkHit(canvasX: number, canvasY: number): void {
    const normX = (canvasX / this.canvas.width) * 100;
    const normY = (canvasY / this.canvas.height) * 140;

    // Margen de error holgado (26 unidades sobre 100)
    const tolerance = 26;

    for (let i = 0; i < this.samplePoints.length; i++) {
      if (this.visitedIndices.has(i)) continue;
      const pt = this.samplePoints[i];
      const dist = Math.hypot(normX - pt.x, normY - pt.y);
      if (dist <= tolerance) {
        this.visitedIndices.add(i);
      }
    }
  }

  public evaluate(): TracingResult {
    const total = this.samplePoints.length;
    if (total === 0) {
      return { covered: 0, passed: false, wentBackwards: false };
    }

    const coveredRatio = this.visitedIndices.size / total;
    // Margen de error pedagógico infantil: con 50% de cobertura, el niño ya reconoció y trazó la forma
    const passed = coveredRatio >= this.threshold;

    return {
      covered: Math.min(1.0, Math.round(coveredRatio * 100) / 100),
      passed,
      wentBackwards: false,
      message: passed
        ? '¡Excelente trazo! ¡Lo hiciste muy bien!'
        : '¡Casi lo logras! Sigue la línea azul un poquito más.',
    };
  }
}
