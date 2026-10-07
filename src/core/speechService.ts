export type SpeechSpeed = 'normal' | 'lenta' | 'muy_lenta';

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private speedRates: Record<SpeechSpeed, number> = {
    normal: 0.85,
    lenta: 0.70,
    muy_lenta: 0.55,
  };
  private currentSpeed: SpeechSpeed = 'normal';
  private isMuted: boolean = false;
  private onSpeechStartCallbacks: Set<() => void> = new Set();
  private onSpeechEndCallbacks: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadSavedSpeed();
      this.initVoices();
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

    const findBestVoice = () => {
      const voices = this.synth?.getVoices() || [];
      if (voices.length === 0) return null;

      // 1. es-PE específico
      const esPE = voices.find((v) => v.lang.toLowerCase() === 'es-pe');
      if (esPE) return esPE;

      // 2. es-MX o es-419
      const esMX = voices.find((v) => v.lang.toLowerCase() === 'es-mx' || v.lang.toLowerCase() === 'es-419');
      if (esMX) return esMX;

      // 3. Voz femenina en español
      const esFemale = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('es') &&
          (v.name.toLowerCase().includes('female') ||
           v.name.toLowerCase().includes('sabina') ||
           v.name.toLowerCase().includes('luciana') ||
           v.name.toLowerCase().includes('paulina') ||
           v.name.toLowerCase().includes('monica') ||
           v.name.toLowerCase().includes('helena') ||
           v.name.toLowerCase().includes('zira'))
      );
      if (esFemale) return esFemale;

      // 4. Cualquier voz en español
      const esAny = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
      return esAny || voices[0] || null;
    };

    this.currentVoice = findBestVoice();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.currentVoice = findBestVoice();
      };
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

  public speak(text: string, onEnd?: () => void): void {
    if (this.isMuted || !this.synth || !text.trim()) {
      if (onEnd) setTimeout(onEnd, 300);
      return;
    }

    try {
      this.synth.cancel(); // Cancelar locución previa para evitar acumulación

      if (!this.currentVoice) {
        this.initVoices();
      }

      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }
      utterance.lang = this.currentVoice?.lang || 'es-PE';
      utterance.rate = this.speedRates[this.currentSpeed];
      utterance.pitch = 1.15; // Tono cálido, amigable e infantil

      let ended = false;
      const finish = () => {
        if (ended) return;
        ended = true;
        this.onSpeechEndCallbacks.forEach((cb) => cb());
        if (onEnd) onEnd();
      };

      utterance.onstart = () => {
        this.onSpeechStartCallbacks.forEach((cb) => cb());
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Respaldo por si el motor TTS del navegador no dispara onend
      const fallbackMs = Math.max(3000, (text.length / 8) * 1000);
      setTimeout(() => {
        if (!ended) finish();
      }, fallbackMs);

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService] Error al reproducir voz:', err);
      if (onEnd) onEnd();
    }
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.onSpeechEndCallbacks.forEach((cb) => cb());
  }
}

export const speechService = new SpeechService();
