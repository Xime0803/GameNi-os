import { audioService } from '../core/audioService';
import { progressService } from '../core/progressService';
import { speechService } from '../core/speechService';
import { BigButton } from './BigButton';

export interface StarBarOptions {
  onBackToMap?: () => void;
  showMapButton?: boolean;
}

export class StarBar {
  private element: HTMLElement;
  private starCountSpan: HTMLElement;
  private profileBadgeSpan: HTMLElement;
  private muteBtn: BigButton;

  constructor(options: StarBarOptions = {}) {
    this.element = document.createElement('header');
    this.element.className = 'top-bar';

    // Izquierda: Volver al Mapa (si aplica) y Perfil activo
    const leftContainer = document.createElement('div');
    leftContainer.className = 'top-bar-left';

    if (options.showMapButton !== false && options.onBackToMap) {
      const backBtn = new BigButton({
        icon: '🎪',
        text: 'Circo',
        color: 'sky',
        ariaLabel: 'Volver a la carpa del circo',
        onClick: () => options.onBackToMap!(),
      });
      leftContainer.appendChild(backBtn.getElement());
    }

    this.profileBadgeSpan = document.createElement('div');
    this.profileBadgeSpan.className = 'timer-badge pulse-gentle';
    this.profileBadgeSpan.textContent = '👤 ...';
    leftContainer.appendChild(this.profileBadgeSpan);

    // Centro: Contador de Estrellas Doradas
    const centerContainer = document.createElement('div');
    centerContainer.className = 'star-counter';
    centerContainer.setAttribute('aria-label', 'Estrellas acumuladas');
    centerContainer.innerHTML = '⭐ ';
    this.starCountSpan = document.createElement('span');
    this.starCountSpan.textContent = '0';
    centerContainer.appendChild(this.starCountSpan);

    // Derecha: Mute + Acceso Adultos
    const rightContainer = document.createElement('div');
    rightContainer.className = 'top-bar-right';

    this.muteBtn = new BigButton({
      icon: '🔊',
      color: 'sun',
      ariaLabel: 'Silenciar o activar sonidos',
      onClick: () => this.toggleSound(),
    });
    rightContainer.appendChild(this.muteBtn.getElement());

    // Botón para padres y maestros
    const adultPanelBtn = new BigButton({
      icon: '🔒',
      text: 'Adultos',
      color: 'lavender',
      ariaLabel: 'Abrir panel de padres y maestros',
      onClick: () => {
        window.location.href = './panel.html';
      },
    });
    rightContainer.appendChild(adultPanelBtn.getElement());

    this.element.appendChild(leftContainer);
    this.element.appendChild(centerContainer);
    this.element.appendChild(rightContainer);

    this.refresh();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public async refresh(): Promise<void> {
    const rewards = await progressService.getRewardState();
    this.starCountSpan.textContent = rewards.totalStars.toString();

    const profile = await progressService.getActiveProfile();
    this.profileBadgeSpan.textContent = `${profile.avatar} ${profile.name}`;
  }

  private toggleSound(): void {
    const currentMuted = audioService.getMuted();
    const newMuted = !currentMuted;
    audioService.setMuted(newMuted);
    speechService.setMuted(newMuted);
    this.muteBtn.getElement().querySelector('.btn-icon')!.textContent = newMuted ? '🔇' : '🔊';
  }
}
