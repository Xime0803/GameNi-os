export class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicTimer: number | null = null;

  constructor() {
    // AudioContext diferido hasta la primera interacción del usuario
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.musicPlaying) {
      this.stopBackgroundMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Clic suave al tocar cualquier botón
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // Acorde mayor de éxito (Do - Mi - Sol)
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  // Sonido de estrella brillante mágica
  public playStar(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // Re mayor brillante
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // Pista suave para animar ante error (cero sensación de derrota)
  public playGentleHint(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(392.0, ctx.currentTime); // G4
    osc.frequency.exponentialRampToValueAtTime(440.0, ctx.currentTime + 0.2); // A4 amable

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // Onomatopeya o sonido real del animal circense
  public playAnimalVocal(characterId: string): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    switch (characterId) {
      case 'pomni': // Mono alegre: chattering
        [400, 600, 450, 700].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.06, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.06);
        });
        break;

      case 'jax': // Conejo boing
        const oscJ = ctx.createOscillator();
        const gainJ = ctx.createGain();
        oscJ.type = 'sine';
        oscJ.frequency.setValueAtTime(250, now);
        oscJ.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        gainJ.gain.setValueAtTime(0.15, now);
        gainJ.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        oscJ.connect(gainJ);
        gainJ.connect(ctx.destination);
        oscJ.start();
        oscJ.stop(now + 0.25);
        break;

      case 'gangle': // Ranita croac
        [200, 240].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + i * 0.12);
          gain.gain.setValueAtTime(0.07, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.1);
        });
        break;

      case 'kinger': // Elefante trompeta
        const oscK = ctx.createOscillator();
        const gainK = ctx.createGain();
        oscK.type = 'sawtooth';
        oscK.frequency.setValueAtTime(160, now);
        oscK.frequency.linearRampToValueAtTime(240, now + 0.3);
        gainK.gain.setValueAtTime(0.12, now);
        gainK.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        oscK.connect(gainK);
        gainK.connect(ctx.destination);
        oscK.start();
        oscK.stop(now + 0.4);
        break;

      default: // Chime suave genérico
        this.playClick();
        break;
    }
  }

  // Fanfarria de celebración final de sesión
  public playCheer(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25], // C5, E5
      [587.33, 739.99], // D5, F#5
      [659.25, 830.61], // E5, G#5
      [783.99, 1046.5], // G5, C6
    ];

    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + step * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    });
  }

  // Música suave de fondo circense (síntesis armónica apacible)
  public startBackgroundMusic(): void {
    if (this.isMuted || this.musicPlaying) return;
    this.musicPlaying = true;
    const ctx = this.getContext();
    if (!ctx) return;

    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 587.33, 523.25];
    let noteIdx = 0;

    const scheduleNextNote = () => {
      if (!this.musicPlaying) return;
      const freq = melody[noteIdx % melody.length];
      noteIdx++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq / 2, ctx.currentTime);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.75);

      this.musicTimer = window.setTimeout(scheduleNextNote, 800);
    };

    scheduleNextNote();
  }

  public stopBackgroundMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audioService = new AudioService();
