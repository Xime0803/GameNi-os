import { numberToSpanishWord } from './numberWords';

export type SpeechSpeed = 'normal' | 'lenta' | 'muy_lenta';

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private speedRates: Record<SpeechSpeed, number> = {
    normal: 0.90,
    lenta: 0.72,
    muy_lenta: 0.58,
  };
  private currentSpeed: SpeechSpeed = 'normal';
  private isMuted: boolean = false;
  private isPrewarmed: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeechStartCallbacks: Set<() => void> = new Set();
  private onSpeechEndCallbacks: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadSavedSpeed();
      this.initVoices();

      // Pre-calentar el motor de voz al primer toque del usuario para eliminar el retardo de 500ms
      const warmup = () => {
        this.prewarm();
        window.removeEventListener('pointerdown', warmup);
        window.removeEventListener('keydown', warmup);
      };
      window.addEventListener('pointerdown', warmup, { passive: true });
      window.addEventListener('keydown', warmup, { passive: true });
    }
  }

  private loadSavedSpeed(): void {
    try {
      const saved = localStorage.getItem('ximenita_voice_speed') as SpeechSpeed | null;
      if (saved && this.speedRates[saved]) {
        this.currentSpeed = saved;
      }
    } catch {
      // Ignorar fallback
    }
  }

  public initVoices(): void {
    if (!this.synth) return;

    const findBestVoice = (): SpeechSynthesisVoice | null => {
      const voices = this.synth?.getVoices() || [];
      if (voices.length === 0) return null;

      const spanishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
      if (spanishVoices.length === 0) return voices[0] || null;

      // 1. CRÍTICO: Priorizar voces LOCALES (localService === true)
      // Las voces remotas (cloud) provocan latencias de 500ms-1500ms por llamada HTTP de red.
      // Las voces locales se ejecutan en 0-10ms directamente por la CPU/SAPI de Windows.
      const localVoices = spanishVoices.filter((v) => v.localService === true);
      const searchPool = localVoices.length > 0 ? localVoices : spanishVoices;

      // 2. es-PE local específico si existe
      const esPE = searchPool.find((v) => v.lang.toLowerCase() === 'es-pe');
      if (esPE) return esPE;

      // 3. es-MX o es-419 (acento latino infantil cálido)
      const esLatam = searchPool.find((v) => {
        const l = v.lang.toLowerCase();
        return l === 'es-mx' || l === 'es-419' || l === 'es-co' || l === 'es-cl';
      });
      if (esLatam) return esLatam;

      // 4. Voz femenina nativa (Microsoft Sabina, Microsoft Laura, Microsoft Helena, Paulina, etc.)
      const esFemale = searchPool.find((v) => {
        const n = v.name.toLowerCase();
        return (
          n.includes('sabina') ||
          n.includes('helena') ||
          n.includes('laura') ||
          n.includes('luciana') ||
          n.includes('paulina') ||
          n.includes('monica') ||
          n.includes('female')
        );
      });
      if (esFemale) return esFemale;

      // 5. Primera opción del pool local o disponible
      return searchPool[0];
    };

    this.currentVoice = findBestVoice();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.currentVoice = findBestVoice();
      };
    }
  }

  // Pre-calentamiento silencioso del sintetizador (elimina lag de primer uso)
  public prewarm(): void {
    if (!this.synth || this.isPrewarmed) return;
    this.isPrewarmed = true;

    try {
      this.initVoices();
      if (this.synth.paused) {
        this.synth.resume();
      }
      const dummy = new SpeechSynthesisUtterance(' ');
      dummy.volume = 0.01;
      dummy.rate = 2.0;
      if (this.currentVoice) {
        dummy.voice = this.currentVoice;
        dummy.lang = this.currentVoice.lang;
      }
      this.synth.speak(dummy);
    } catch {
      // Ignorar fallback
    }
  }

  public setSpeed(speed: SpeechSpeed): void {
    if (this.speedRates[speed]) {
      this.currentSpeed = speed;
      try {
        localStorage.setItem('ximenita_voice_speed', speed);
      } catch {
        // Ignorar
      }
    }
  }

  public getSpeed(): SpeechSpeed {
    return this.currentSpeed;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public onStart(cb: () => void): () => void {
    this.onSpeechStartCallbacks.add(cb);
    return () => this.onSpeechStartCallbacks.delete(cb);
  }

  public onEnd(cb: () => void): () => void {
    this.onSpeechEndCallbacks.add(cb);
    return () => this.onSpeechEndCallbacks.delete(cb);
  }

  /**
   * Pronuncia un número instantáneamente convirtiéndolo a palabras fonéticas ("¡Uno!", "¡Dos!")
   * con velocidad ágil (rate 1.05) para conteo táctil inmediato.
   */
  public speakNumber(num: number, prefix: string = '', onEnd?: () => void): void {
    const word = numberToSpanishWord(num);
    const phrase = prefix ? `${prefix} ${word}` : `¡${word}!`;
    this.speakFast(phrase, onEnd);
  }

  /**
   * Modo ágil sin retardos para respuestas de selección táctil inmediata
   */
  public speakFast(text: string, onEnd?: () => void): void {
    this.speak(text, onEnd, 1.05);
  }

  public speak(text: string, onEnd?: () => void, customRate?: number): void {
    if (this.isMuted || !this.synth || !text.trim()) {
      if (onEnd) setTimeout(onEnd, 100);
      return;
    }

    try {
      // Pre-procesamiento de números sueltos: "1" -> "¡Uno!", "5" -> "¡Cinco!"
      const trimmed = text.trim();
      let textToSpeak = trimmed;
      const parsedNum = parseInt(trimmed, 10);
      if (!isNaN(parsedNum) && trimmed === parsedNum.toString()) {
        textToSpeak = `¡${numberToSpanishWord(parsedNum)}!`;
      }

      const wasSpeaking = this.synth.speaking || this.synth.pending;
      if (wasSpeaking) {
        this.synth.cancel();
      }

      // En Chromium, un micro-retardo de 20ms tras cancelar previene que se descarte la nueva locución
      const delayMs = wasSpeaking ? 25 : 0;

      if (delayMs > 0) {
        setTimeout(() => {
          this.doSpeak(textToSpeak, onEnd, customRate);
        }, delayMs);
      } else {
        this.doSpeak(textToSpeak, onEnd, customRate);
      }
    } catch (err) {
      console.warn('[SpeechService] Error al preparar locución:', err);
      if (onEnd) onEnd();
    }
  }

  private doSpeak(text: string, onEnd?: () => void, customRate?: number): void {
    if (!this.synth || this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    try {
      if (!this.currentVoice) {
        this.initVoices();
      }

      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance; // Retener referencia activa para evitar Garbage Collection prematuro

      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
        utterance.lang = this.currentVoice.lang;
      } else {
        utterance.lang = 'es-ES';
      }

      utterance.rate = customRate || this.speedRates[this.currentSpeed];
      utterance.pitch = 1.15; // Tono cálido, entusiasta e infantil

      let ended = false;
      const finish = () => {
        if (ended) return;
        ended = true;
        this.activeUtterance = null;
        this.onSpeechEndCallbacks.forEach((cb) => cb());
        if (onEnd) onEnd();
      };

      utterance.onstart = () => {
        this.onSpeechStartCallbacks.forEach((cb) => cb());
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Respaldo de seguridad en caso de congelamiento del evento onend del navegador
      const fallbackMs = Math.max(1800, (text.length / 8) * 1000);
      setTimeout(() => {
        if (!ended) finish();
      }, fallbackMs);

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService] Error al reproducir voz:', err);
      if (onEnd) onEnd();
    }
  }

  public isBusy(): boolean {
    return Boolean(this.activeUtterance || (this.synth && (this.synth.speaking || this.synth.pending)));
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.activeUtterance) {
      this.activeUtterance = null;
    }
    this.onSpeechEndCallbacks.forEach((cb) => cb());
  }
}

export const speechService = new SpeechService();
