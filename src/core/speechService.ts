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

  private initVoices(): void {
    if (!this.synth) return;

    const findBestVoice = () => {
      const voices = this.synth?.getVoices() || [];
      // Buscar es-PE primero, luego es-MX, luego es-419 o cualquier es
      const esPE = voices.find((v) => v.lang.toLowerCase() === 'es-pe');
      if (esPE) return esPE;

      const esMX = voices.find((v) => v.lang.toLowerCase() === 'es-mx');
      if (esMX) return esMX;

      const esAnyFemale = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('es') &&
          (v.name.toLowerCase().includes('female') ||
           v.name.toLowerCase().includes('sabina') ||
           v.name.toLowerCase().includes('luciana') ||
           v.name.toLowerCase().includes('paulina') ||
           v.name.toLowerCase().includes('monica'))
      );
      if (esAnyFemale) return esAnyFemale;

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

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }
      utterance.lang = this.currentVoice?.lang || 'es-PE';
      utterance.rate = this.speedRates[this.currentSpeed];
      utterance.pitch = 1.15; // Tono ligeramente más agudo e infantil / cálido

      utterance.onstart = () => {
        this.onSpeechStartCallbacks.forEach((cb) => cb());
      };

      utterance.onend = () => {
        this.onSpeechEndCallbacks.forEach((cb) => cb());
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.onSpeechEndCallbacks.forEach((cb) => cb());
        if (onEnd) onEnd();
      };

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
