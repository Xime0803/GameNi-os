import { speechService } from '../core/speechService';

export type XimenitaState = 'idle' | 'speaking' | 'celebrating' | 'hint';
export type XimenitaOutfit = 'default' | 'artist' | 'explorer' | 'chef' | 'magician' | 'detective';

export class XimenitaComponent {
  private container: HTMLElement;
  private state: XimenitaState = 'idle';
  private outfit: XimenitaOutfit = 'default';
  private bubbleEl: HTMLElement | null = null;
  private unsubscribeSpeechEnd: (() => void) | null = null;

  constructor(outfit: XimenitaOutfit = 'default') {
    this.outfit = outfit;
    this.container = document.createElement('div');
    this.container.className = 'ximenita-wrapper';
    this.render();

    // Sincronizar automáticamente con fin de voz
    this.unsubscribeSpeechEnd = speechService.onEnd(() => {
      if (this.state === 'speaking') {
        this.setState('idle');
      }
    });
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setOutfit(outfit: XimenitaOutfit): void {
    this.outfit = outfit;
    this.render();
  }

  public setState(state: XimenitaState): void {
    this.state = state;
    this.updateVisualClasses();
  }

  public narrate(text: string, onFinish?: () => void): void {
    this.setState('speaking');
    this.showSpeechBubble(text);

    speechService.speak(text, () => {
      this.setState('idle');
      this.hideSpeechBubble();
      if (onFinish) onFinish();
    });
  }

  public celebrate(customText?: string, onFinish?: () => void): void {
    const defaultPhrases = [
      '¡Siii! ¡Lo hiciste genial!',
      '¡Yeeei! ¡Qué divertido, lo lograste!',
      '¡Bravo! ¡Eres increíble!',
      '¡Esooo! ¡Estrellita brillante para ti!',
      '¡Guau! ¡Qué súper campeón eres!',
    ];
    const text = customText || defaultPhrases[Math.floor(Math.random() * defaultPhrases.length)];

    this.setState('celebrating');
    this.showSpeechBubble(text);

    speechService.speakCelebration(text, () => {
      this.setState('idle');
      this.hideSpeechBubble();
      if (onFinish) onFinish();
    });
  }

  public giveHint(customText?: string, onFinish?: () => void): void {
    const defaultPhrases = [
      '¡Uy, casi casi! ¡Intentémoslo juntos otra vez!',
      '¡Tú puedes, amiguito! ¡Vamos de nuevo!',
      '¡Cuenta despacito, yo sé que puedes!',
      '¡Qué divertido! ¡Vamos a intentarlo una vez más!',
    ];
    const text = customText || defaultPhrases[Math.floor(Math.random() * defaultPhrases.length)];

    this.setState('hint');
    this.showSpeechBubble(text);

    speechService.speakHint(text, () => {
      this.setState('idle');
      this.hideSpeechBubble();
      if (onFinish) onFinish();
    });
  }

  private showSpeechBubble(text: string): void {
    if (!this.bubbleEl) {
      this.bubbleEl = document.createElement('div');
      this.bubbleEl.className = 'speech-bubble';
      this.container.appendChild(this.bubbleEl);
    }
    this.bubbleEl.textContent = text;
    this.bubbleEl.style.display = 'block';
  }

  private hideSpeechBubble(): void {
    if (this.bubbleEl) {
      this.bubbleEl.style.display = 'none';
    }
  }

  private updateVisualClasses(): void {
    const avatar = this.container.querySelector('.ximenita-avatar') as HTMLElement;
    if (avatar) {
      avatar.className = `ximenita-avatar state-${this.state} outfit-${this.outfit}`;
    }
  }

  public destroy(): void {
    if (this.unsubscribeSpeechEnd) {
      this.unsubscribeSpeechEnd();
    }
    this.container.remove();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="ximenita-container">
        <div class="ximenita-avatar state-${this.state} outfit-${this.outfit}">
          <!-- SVG Ilustración Vectorial de Ximenita (4 años) -->
          <svg viewBox="0 0 160 220" class="ximenita-svg" width="160" height="220" role="img" aria-label="Ximenita, tu amiga guía de 4 años">
            <defs>
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#C89B6B" />
                <stop offset="50%" stop-color="#E6C79A" />
                <stop offset="100%" stop-color="#C89B6B" />
              </linearGradient>
              <linearGradient id="dressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FF8FA3" />
                <stop offset="100%" stop-color="#E66B82" />
              </linearGradient>
            </defs>

            <!-- Trenza Izquierda -->
            <g class="braid-left">
              <path d="M 40 70 Q 20 100 25 140 Q 20 155 28 165" stroke="url(#hairGrad)" stroke-width="16" stroke-linecap="round" fill="none"/>
              <!-- Liga de trenza -->
              <ellipse cx="28" cy="155" rx="6" ry="4" fill="#FF6B6B"/>
            </g>

            <!-- Trenza Derecha -->
            <g class="braid-right">
              <path d="M 120 70 Q 140 100 135 140 Q 140 155 132 165" stroke="url(#hairGrad)" stroke-width="16" stroke-linecap="round" fill="none"/>
              <!-- Liga de trenza -->
              <ellipse cx="132" cy="155" rx="6" ry="4" fill="#FF6B6B"/>
            </g>

            <!-- Vestido Rosa Coral -->
            <path class="dress" d="M 55 120 L 105 120 L 125 185 Q 80 195 35 185 Z" fill="url(#dressGrad)" />
            <!-- Cuello del vestido -->
            <path d="M 65 120 Q 80 132 95 120" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>

            <!-- Piernitas y zapatitos -->
            <rect x="58" y="185" width="12" height="18" rx="6" fill="#F6D7B8"/>
            <rect x="90" y="185" width="12" height="18" rx="6" fill="#F6D7B8"/>
            <ellipse cx="64" cy="205" rx="10" ry="7" fill="#FF6B6B"/>
            <ellipse cx="96" cy="205" rx="10" ry="7" fill="#FF6B6B"/>

            <!-- Brazos y manitas -->
            <g class="arms">
              <path class="arm-l" d="M 55 125 Q 35 140 38 160" stroke="#F6D7B8" stroke-width="12" stroke-linecap="round" fill="none"/>
              <path class="arm-r" d="M 105 125 Q 125 140 122 160" stroke="#F6D7B8" stroke-width="12" stroke-linecap="round" fill="none"/>
            </g>

            <!-- Cabeza y Cuello -->
            <rect x="73" y="105" width="14" height="18" rx="5" fill="#F6D7B8"/>
            <ellipse class="head" cx="80" cy="72" rx="42" ry="40" fill="#F6D7B8"/>

            <!-- Cabello frontal y flequillo -->
            <path d="M 40 65 Q 80 32 120 65 Q 110 40 80 38 Q 50 40 40 65 Z" fill="url(#hairGrad)"/>
            <circle cx="48" cy="52" r="12" fill="url(#hairGrad)"/>
            <circle cx="112" cy="52" r="12" fill="url(#hairGrad)"/>

            <!-- Ojos grandes y curiosos de 4 años -->
            <g class="eyes">
              <!-- Ojo izquierdo -->
              <ellipse cx="64" cy="72" rx="7" ry="8" fill="#4A3728"/>
              <circle cx="62" cy="70" r="3" fill="#FFFFFF"/>
              <circle cx="66" cy="74" r="1.5" fill="#FFFFFF"/>
              <!-- Ojo derecho -->
              <ellipse cx="96" cy="72" rx="7" ry="8" fill="#4A3728"/>
              <circle cx="94" cy="70" r="3" fill="#FFFFFF"/>
              <circle cx="98" cy="74" r="1.5" fill="#FFFFFF"/>
            </g>

            <!-- Pestañas suaves -->
            <path d="M 58 64 Q 64 61 70 64" stroke="#4A3728" stroke-width="2" fill="none"/>
            <path d="M 90 64 Q 96 61 102 64" stroke="#4A3728" stroke-width="2" fill="none"/>

            <!-- Mejillas rosadas carismáticas (#F4A7A0) -->
            <circle class="cheek" cx="52" cy="82" r="8" fill="#F4A7A0" opacity="0.85"/>
            <circle class="cheek" cx="108" cy="82" r="8" fill="#F4A7A0" opacity="0.85"/>

            <!-- Naricita tierna -->
            <circle cx="80" cy="79" r="2.5" fill="#E8BFA2"/>

            <!-- Boquita tierna y expresiva -->
            <path class="mouth" d="M 72 87 Q 80 97 88 87" stroke="#E05353" stroke-width="3" stroke-linecap="round" fill="#FF8FA3"/>

            <!-- Accesorio según atuendo -->
            ${this.renderOutfitAccessories()}
          </svg>
        </div>
      </div>
    `;

    // Adjuntar estilos específicos del avatar si aún no están en el DOM
    this.injectStylesOnce();
  }

  private renderOutfitAccessories(): string {
    switch (this.outfit) {
      case 'artist':
        return `
          <!-- Delantal de pintora y pincel -->
          <path d="M 60 135 L 100 135 L 105 175 L 55 175 Z" fill="#FFD93D" opacity="0.9"/>
          <circle cx="70" cy="150" r="4" fill="#4D96FF"/>
          <circle cx="85" cy="160" r="4" fill="#6BCB77"/>
        `;
      case 'explorer':
        return `
          <!-- Sombrero de exploradora de selva -->
          <ellipse cx="80" cy="38" rx="46" ry="10" fill="#D97706"/>
          <path d="M 50 38 Q 80 18 110 38 Z" fill="#B45309"/>
        `;
      case 'chef':
        return `
          <!-- Gorro de chef -->
          <path d="M 58 40 Q 50 15 80 15 Q 110 15 102 40 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        `;
      default:
        return `
          <!-- Moño circense en el pelo -->
          <path d="M 73 38 Q 80 32 87 38 L 80 43 Z" fill="#FFD93D"/>
        `;
    }
  }

  private injectStylesOnce(): void {
    if (document.getElementById('ximenita-component-styles')) return;

    const style = document.createElement('style');
    style.id = 'ximenita-component-styles';
    style.textContent = `
      .ximenita-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
        z-index: 90;
      }

      .ximenita-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .ximenita-avatar {
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      /* 1. Estado Idle: Respiración suave */
      .ximenita-avatar.state-idle .head {
        animation: ximenitaBreathe 3s ease-in-out infinite;
      }

      @keyframes ximenitaBreathe {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }

      /* 2. Estado Habla: Boquita y cabeza enérgica */
      .ximenita-avatar.state-speaking .mouth {
        animation: ximenitaMouthMove 0.22s ease-in-out infinite alternate;
        transform-origin: 80px 88px;
      }

      @keyframes ximenitaMouthMove {
        from { transform: scaleY(0.7); }
        to { transform: scaleY(1.5) scaleX(1.1); }
      }

      /* 3. Estado Celebra: Salto de alegría */
      .ximenita-avatar.state-celebrating {
        animation: ximenitaJump 0.6s ease-in-out infinite;
      }

      @keyframes ximenitaJump {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-28px) scale(1.08); }
      }

      /* 4. Estado Pista: Inclinación de cabeza curiosa */
      .ximenita-avatar.state-hint {
        transform: rotate(8deg) translateY(-4px);
        transition: transform 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }
}
