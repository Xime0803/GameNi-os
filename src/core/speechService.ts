import { numberToSpanishWord } from './numberWords';

export type SpeechSpeed = 'normal' | 'lenta' | 'muy_lenta';

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private speedRates: Record<SpeechSpeed, number> = {
    normal: 1.04, // Ritmo ágil, despierto y alegre de niña
    lenta: 0.88,
    muy_lenta: 0.74,
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

      // 1. MÁXIMA PRIORIDAD: Voces Neuronales / Naturales Femeninas (las más humanas en Edge, Chrome, Android e iOS)
      // Ej: Microsoft Salma Natural, Microsoft Dalia Natural, Google español, Paulina (Enhanced)
      const naturalFemale = spanishVoices.find((v) => {
        const n = v.name.toLowerCase();
        const isNatural =
          n.includes('natural') ||
          n.includes('neural') ||
          n.includes('online') ||
          n.includes('google') ||
          n.includes('enhanced');
        const isFemale =
          n.includes('salma') ||
          n.includes('dalia') ||
          n.includes('paloma') ||
          n.includes('jimena') ||
          n.includes('camila') ||
          n.includes('elena') ||
          n.includes('laura') ||
          n.includes('paulina') ||
          n.includes('español') ||
          n.includes('spanish') ||
          n.includes('female');
        return isNatural && isFemale;
      });
      if (naturalFemale) return naturalFemale;

      // 2. Cualquier voz clasificada como Natural o Google en español
      const anyNatural = spanishVoices.find((v) => {
        const n = v.name.toLowerCase();
        return n.includes('natural') || n.includes('neural') || n.includes('google');
      });
      if (anyNatural) return anyNatural;

      // 3. Voces femeninas latinas de alta calidad
      const latinFemale = spanishVoices.find((v) => {
        const n = v.name.toLowerCase();
        const l = v.lang.toLowerCase();
        const isLatam =
          l === 'es-mx' || l === 'es-419' || l === 'es-pe' || l === 'es-co' || l === 'es-cl' || l === 'es-us';
        const isFemale =
          n.includes('paulina') ||
          n.includes('monica') ||
          n.includes('sabina') ||
          n.includes('laura') ||
          n.includes('luciana') ||
          n.includes('helena') ||
          n.includes('francisca');
        return isLatam && isFemale;
      });
      if (latinFemale) return latinFemale;

      // 4. Cualquier voz femenina en español
      const anyFemale = spanishVoices.find((v) => {
        const n = v.name.toLowerCase();
        return (
          n.includes('paulina') ||
          n.includes('monica') ||
          n.includes('sabina') ||
          n.includes('laura') ||
          n.includes('luciana') ||
          n.includes('helena') ||
          n.includes('francisca') ||
          n.includes('female')
        );
      });
      if (anyFemale) return anyFemale;

      // 5. Dialectos latinos amables (es-PE, es-MX, es-419)
      const latam = spanishVoices.find((v) => {
        const l = v.lang.toLowerCase();
        return l === 'es-pe' || l === 'es-mx' || l === 'es-419';
      });
      if (latam) return latam;

      // 6. Primera voz en español disponible
      return spanishVoices[0];
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
   * con entonación melódica ascendente de niña alegre.
   */
  public speakNumber(num: number, prefix: string = '', onEnd?: () => void): void {
    const word = numberToSpanishWord(num);
    const phrase = prefix ? `${prefix} ${word}` : `¡${word}!`;
    // Progresión melódica ascendente (1.28 -> 1.35) para que el conteo infantil suene alegre y emocionante
    const cheerfulPitch = Math.min(1.36, 1.28 + (num ? Math.min(num, 5) * 0.015 : 0.02));
    this.speakFast(phrase, onEnd, cheerfulPitch);
  }

  /**
   * Locución especial de celebración alegre y entusiasta
   */
  public speakCelebration(text: string, onEnd?: () => void): void {
    this.speak(text, onEnd, 1.06, 1.33);
  }

  /**
   * Locución dulce y motivadora para pistas o correcciones amables
   */
  public speakHint(text: string, onEnd?: () => void): void {
    this.speak(text, onEnd, 0.98, 1.26);
  }

  /**
   * Modo ágil sin retardos para respuestas de selección táctil inmediata
   */
  public speakFast(text: string, onEnd?: () => void, customPitch?: number): void {
    this.speak(text, onEnd, 1.08, customPitch || 1.30);
  }

  public speak(text: string, onEnd?: () => void, customRate?: number, customPitch?: number): void {
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
          this.doSpeak(textToSpeak, onEnd, customRate, customPitch);
        }, delayMs);
      } else {
        this.doSpeak(textToSpeak, onEnd, customRate, customPitch);
      }
    } catch (err) {
      console.warn('[SpeechService] Error al preparar locución:', err);
      if (onEnd) onEnd();
    }
  }

  private doSpeak(text: string, onEnd?: () => void, customRate?: number, customPitch?: number): void {
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
      // Tono natural de niña alegre (1.28 a 1.35 según emoción)
      utterance.pitch = customPitch || 1.28;

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
