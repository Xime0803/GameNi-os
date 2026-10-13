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

  // Despierta el contexto de audio en el primer gesto del usuario
  public unlock(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
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

  // Tono melódico pedagógico de marimba acústica natural con ataque de maza de madera
  public playNumberTone(count: number): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Escala diatónica en Do mayor (C4 a C6)
    const scale = [
      261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, // Do4 - Si4
      523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, // Do5 - Si5
      1046.50 // Do6
    ];

    const idx = Math.max(0, (count - 1) % scale.length);
    const freq = scale[idx];
    const now = ctx.currentTime;

    // Filtro acústico de cuerpo de madera (elimina asperezas digitales)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.Q.setValueAtTime(1.2, now);

    // 1. Onda fundamental pura y cálida (cuerpo del instrumento)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Curva anti-clic de ataque suave (3ms) y decaimiento resonante natural
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    // 2. Sobretono armónico de barra de madera (4to armónico con decaimiento rápido percusivo)
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 3.98, now);

    gainHarmonic.gain.setValueAtTime(0.001, now);
    gainHarmonic.gain.linearRampToValueAtTime(0.09, now + 0.003);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    oscHarmonic.connect(gainHarmonic);
    gain.connect(filter);
    gainHarmonic.connect(filter);
    filter.connect(ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 0.38);
    oscHarmonic.stop(now + 0.38);
  }

  // Acorde mayor de éxito cálido y festivo (Celesta / Campanitas mágicas)
  public playSuccess(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.07;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, startTime);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Armónico sutil de campanilla
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq * 2.76, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      bellGain.gain.setValueAtTime(0.001, startTime);
      bellGain.gain.linearRampToValueAtTime(0.05, startTime + 0.003);
      bellGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      bell.connect(bellGain);
      gain.connect(filter);
      bellGain.connect(filter);
      filter.connect(ctx.destination);

      osc.start(startTime);
      bell.start(startTime);
      osc.stop(startTime + 0.48);
      bell.stop(startTime + 0.48);
    });
  }

  // Sonido de estrella brillante mágica (Arpegio suave con brillo)
  public playStar(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.055;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.16, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.48);
    });
  }

  // Pista suave para animar ante error (cero sensación de derrota, maza de madera amable)
  public playGentleHint(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [392.0, 523.25]; // Sol4 a Do5 cálido
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.12;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, startTime);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.34);
    });
  }

  // Fanfarria de celebración final de sesión
  public playCheer(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25],
      [587.33, 739.99],
      [659.25, 830.61],
      [783.99, 1046.5],
    ];

    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + step * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    });
  }

  // =========================================================================
  // SONIDOS DE ANIMALES REALISTAS (Modelado acústico con formantes y envolventes)
  // =========================================================================

  public playAnimalVocal(animalId: string): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const id = animalId.toLowerCase();

    if (id.includes('perro') || id.includes('dog')) {
      this.playRealisticDog(ctx);
    } else if (id.includes('gato') || id.includes('cat')) {
      this.playRealisticCat(ctx);
    } else if (id.includes('vaca') || id.includes('cow')) {
      this.playRealisticCow(ctx);
    } else if (id.includes('lion') || id.includes('leon') || id.includes('ragatha')) {
      this.playRealisticLion(ctx);
    } else if (id.includes('pato') || id.includes('duck')) {
      this.playRealisticDuck(ctx);
    } else if (id.includes('rana') || id.includes('frog') || id.includes('gangle')) {
      this.playRealisticFrog(ctx);
    } else if (id.includes('elefante') || id.includes('elephant') || id.includes('kinger')) {
      this.playRealisticElephant(ctx);
    } else if (id.includes('mono') || id.includes('monkey') || id.includes('pomni')) {
      this.playRealisticMonkey(ctx);
    } else if (id.includes('oveja') || id.includes('sheep')) {
      this.playRealisticSheep(ctx);
    } else if (id.includes('gallo') || id.includes('rooster') || id.includes('pollo')) {
      this.playRealisticRooster(ctx);
    } else if (id.includes('conejo') || id.includes('rabbit') || id.includes('jax')) {
      this.playRealisticRabbitBoing(ctx);
    } else if (id.includes('pajaro') || id.includes('ave') || id.includes('bird') || id.includes('caine')) {
      this.playRealisticBird(ctx);
    } else {
      this.playRealisticDog(ctx);
    }
  }

  // 1. LEÓN: Rugido profundo realista con rugosidad y resonancia gutural
  private playRealisticLion(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 1.3;

    // Oscilador gutural con dientes de sierra a baja frecuencia
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(65, now + duration);

    // Filtro formante resonante de garganta
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(550, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    filter.Q.setValueAtTime(4, now);

    // Envolvente de volumen de rugido
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Ruido de respiración / soplido feroz
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(320, now);
    noiseFilter.Q.setValueAtTime(2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
    noise.start(now);
    noise.stop(now + duration);
  }

  // 2. VACA: Mugido largo inconfundible ("Muuuu")
  private playRealisticCow(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 1.4;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(95, now + duration);

    // Filtros de formante nasal que se abren a "UUUU"
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.linearRampToValueAtTime(420, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);
    filter.Q.setValueAtTime(5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.25);
    gain.gain.setValueAtTime(0.26, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // 3. PERRO: Ladrido nítido doble ("¡Guau! ¡Guau!")
  private playRealisticDog(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const barks = [0, 0.3]; // Dos ladridos separados

    barks.forEach((offset) => {
      const startTime = now + offset;
      const barkDuration = 0.22;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, startTime);
      osc.frequency.exponentialRampToValueAtTime(110, startTime + barkDuration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, startTime);
      filter.frequency.exponentialRampToValueAtTime(280, startTime + barkDuration);
      filter.Q.setValueAtTime(3, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + barkDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + barkDuration);
    });
  }

  // 4. GATO: Maullido tierno expresivo ("¡Miau!")
  private playRealisticCat(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 0.95;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    // Glissando característico: sube y luego baja suavemente
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(320, now + duration);

    // Vibrato natural
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(5.5, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(15, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration);
    osc.stop(now + duration);
  }

  // 5. ELEFANTE: Barrito resonante de trompeta ("¡Fruuuuut!")
  private playRealisticElephant(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 1.1;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.25);
    osc.frequency.setValueAtTime(520, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(220, now + duration);

    // Trémolo de aire dentro de la trompa (24 Hz)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(24, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(35, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(4.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.18);
    gain.gain.setValueAtTime(0.28, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration);
    osc.stop(now + duration);
  }

  // 6. MONO: Risa y chillido de monito de la selva ("¡Uh-uh! ¡Ah-ah!")
  private playRealisticMonkey(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const whoops = [0, 0.18, 0.36, 0.54, 0.72]; // Secuencia rítmica de chillidos

    whoops.forEach((offset, idx) => {
      const startTime = now + offset;
      const chirpDur = 0.13;
      const baseFreq = idx % 2 === 0 ? 520 : 850;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 350, startTime + chirpDur * 0.7);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, startTime + chirpDur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + chirpDur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + chirpDur);
    });
  }

  // 7. RANA: Croar profundo rasposo ("¡Croac! ¡Croac!")
  private playRealisticFrog(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const croaks = [0, 0.35];

    croaks.forEach((offset) => {
      const startTime = now + offset;
      const dur = 0.22;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, startTime);
      osc.frequency.linearRampToValueAtTime(140, startTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(80, startTime + dur);

      // Modulación rápida que produce el raspado de garganta (38 Hz)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(38, startTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, startTime);
      filter.Q.setValueAtTime(6, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.26, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(startTime);
      osc.start(startTime);
      lfo.stop(startTime + dur);
      osc.stop(startTime + dur);
    });
  }

  // 8. PATO: Graznido nasal ("¡Cuac! ¡Cuac!")
  private playRealisticDuck(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const quacks = [0, 0.28];

    quacks.forEach((offset) => {
      const startTime = now + offset;
      const dur = 0.2;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(180, startTime + dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, startTime);
      filter.Q.setValueAtTime(4, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  // 9. CONEJO: Salto alegre "Boing"
  private playRealisticRabbitBoing(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 10. AVE / TUCÁN: Canto y trino alegre de selva
  private playRealisticBird(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const chirps = [0, 0.12, 0.24];

    chirps.forEach((offset) => {
      const startTime = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1900, startTime);
      osc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.09);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }

  // 11. OVEJA: Balido característico con trémolo ("¡Béeee!")
  private playRealisticSheep(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const dur = 1.1;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(230, now);
    osc.frequency.linearRampToValueAtTime(210, now + dur);

    // Trémolo de garganta de oveja (7.5 Hz)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(7.5, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(22, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(780, now);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.12);
    gain.gain.setValueAtTime(0.25, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + dur);
    osc.stop(now + dur);
  }

  // 12. GALLO: Canto matutino icónico ("¡Ki-ki-ri-kííí!")
  private playRealisticRooster(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Secuencia de las 4 notas de canto del gallo
    const notes = [
      { offset: 0, dur: 0.14, freq: 410 },
      { offset: 0.16, dur: 0.15, freq: 470 },
      { offset: 0.33, dur: 0.17, freq: 540 },
      { offset: 0.52, dur: 0.85, freq: 720 }, // Nota sostenida triunfal
    ];

    notes.forEach(({ offset, dur, freq }, idx) => {
      const startTime = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      if (idx === 3) {
        // En la nota final, vibrato natural
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(6, startTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(14, startTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(startTime);
        lfo.stop(startTime + dur);
      }

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, startTime);
      filter.Q.setValueAtTime(3.5, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  // Música suave de fondo circense
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
