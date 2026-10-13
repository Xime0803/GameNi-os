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

  // Seguimiento de precisión y detección de salida de línea
  private validPointsCount: number = 0;
  private offTrackPointsCount: number = 0;
  private severeOffTrackPointsCount: number = 0;

  // Parámetros calibrados para motricidad infantil (CNEB 3 a 10 años):
  // - HIT_TOLERANCE: radio (0-100) donde el trazo se considera dentro de la línea (ancho azul = 14, radio 7 + margen de dedo infantil = 12)
  private readonly HIT_TOLERANCE: number = 12;
  // - OFF_TRACK_THRESHOLD: distancia a partir de la cual el trazo sale visiblemente del caminito azul (14)
  private readonly OFF_TRACK_THRESHOLD: number = 14;
  // - SEVERE_OFF_TRACK_THRESHOLD: distancia donde el trazo está completamente en el vacío exterior (18)
  private readonly SEVERE_OFF_TRACK_THRESHOLD: number = 18;

  // Cobertura mínima requerida: 65% de la figura trazada
  private threshold: number = 0.65;
  private onStrokeUpdate?: (coverage: number, isOffTrack: boolean) => void;

  constructor(canvas: HTMLCanvasElement, threshold: number = 0.65) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not supported');
    this.ctx = context;
    this.threshold = threshold;
    this.initPointerEvents();
  }

  public setGuide(guide: TracingGuide): void {
    this.guide = guide;
    this.samplePoints = this.sampleSvgPath(guide.svgPath, 70);
    this.clear();
  }

  public setSamplePointsForTesting(points: { x: number; y: number }[]): void {
    this.samplePoints = points;
    this.clear();
  }

  public setOnStrokeUpdate(cb: (coverage: number, isOffTrack: boolean) => void): void {
    this.onStrokeUpdate = cb;
  }

  public clear(): void {
    this.visitedIndices.clear();
    this.validPointsCount = 0;
    this.offTrackPointsCount = 0;
    this.severeOffTrackPointsCount = 0;
    this.lastX = -1;
    this.lastY = -1;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundGuide();
    if (this.onStrokeUpdate) {
      this.onStrokeUpdate(0, false);
    }
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

    // 1. Dibujar contorno de guía azul punteada
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

    // 2. Dibujar punto rojo de inicio (start dot)
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
    const scaleX = rect.width > 0 ? this.canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? this.canvas.height / rect.height : 1;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Dibujar trazo continuo
    this.ctx.save();
    this.ctx.lineWidth = 16;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#FF6B6B'; // Trazo coral
    this.ctx.fillStyle = '#FF6B6B';

    if (isStart || this.lastX < 0 || this.lastY < 0) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.checkHit(x, y);
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      // Interpolación entre puntos consecutivos
      const dist = Math.hypot(x - this.lastX, y - this.lastY);
      const steps = Math.max(1, Math.floor(dist / 5));
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
    const isOffTrack = this.isCurrentlyOffTrack();

    if (this.onStrokeUpdate) {
      this.onStrokeUpdate(currentCoverage, isOffTrack);
    }
  }

  public simulatePoint(canvasX: number, canvasY: number): void {
    this.checkHit(canvasX, canvasY);
  }

  // Verifica cercanía y detecta si se sale de la línea
  private checkHit(canvasX: number, canvasY: number): void {
    if (this.samplePoints.length === 0) return;

    const normX = (canvasX / this.canvas.width) * 100;
    const normY = (canvasY / this.canvas.height) * 140;

    let minDist = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < this.samplePoints.length; i++) {
      const pt = this.samplePoints[i];
      const dist = Math.hypot(normX - pt.x, normY - pt.y);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    if (closestIndex === -1) return;

    // 1. ¿Está dentro de la línea de tolerancia (caminito)?
    if (minDist <= this.HIT_TOLERANCE) {
      this.validPointsCount++;
      this.visitedIndices.add(closestIndex);
      // Registrar puntos vecinos cercanos en el mismo radio
      for (let i = 0; i < this.samplePoints.length; i++) {
        if (!this.visitedIndices.has(i)) {
          const pt = this.samplePoints[i];
          if (Math.hypot(normX - pt.x, normY - pt.y) <= this.HIT_TOLERANCE) {
            this.visitedIndices.add(i);
          }
        }
      }
    }

    // 2. ¿Está fuera de la línea?
    if (minDist > this.OFF_TRACK_THRESHOLD) {
      this.offTrackPointsCount++;
    }
    // 3. ¿Está muy alejado en espacio vacío?
    if (minDist > this.SEVERE_OFF_TRACK_THRESHOLD) {
      this.severeOffTrackPointsCount++;
    }
  }

  // Evalúa si el trazo actual se ha salido de la línea
  public isCurrentlyOffTrack(): boolean {
    const totalPoints = this.validPointsCount + this.offTrackPointsCount;
    if (totalPoints < 8) return false;

    // Se considera fuera de la línea si:
    // a) Tiene al menos 4 puntos en el vacío absoluto (> 18 unidades)
    // b) O más del 15% del total de puntos dibujados están fuera de la línea (> 14 unidades)
    return this.severeOffTrackPointsCount >= 4 || (this.offTrackPointsCount / totalPoints) > 0.15;
  }

  public evaluate(): TracingResult {
    const total = this.samplePoints.length;
    if (total === 0) {
      return { covered: 0, passed: false, wentBackwards: false, wentOffTrack: false };
    }

    const wentOffTrack = this.isCurrentlyOffTrack();
    const coveredRatio = this.visitedIndices.size / total;

    // Criterio pedagógico:
    // 1. Debe cubrir al menos el 65% de la figura
    // 2. NO debe haberse salido de la línea
    const passed = !wentOffTrack && (coveredRatio >= this.threshold);

    let message = '¡Excelente trazo! ¡Lo hiciste muy bien sin salirte!';
    if (wentOffTrack) {
      message = '¡Te saliste del caminito! Borra con el botón celeste y tracemos siguiendo la línea azul.';
    } else if (!passed) {
      message = '¡Casi lo logras! Te faltó completar un pedacito de la línea azul.';
    }

    return {
      covered: Math.min(1.0, Math.round(coveredRatio * 100) / 100),
      passed,
      wentBackwards: false,
      wentOffTrack,
      message,
    };
  }
}
