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
  private backBtn: BigButton | null = null;
  private onBackToMapCallback?: () => void;

  constructor(options: StarBarOptions = {}) {
    this.onBackToMapCallback = options.onBackToMap;
    this.element = document.createElement('header');
    this.element.className = 'top-bar';

    // Izquierda: Botón de Regresar al Menú Principal / Circo y Perfil activo
    const leftContainer = document.createElement('div');
    leftContainer.className = 'top-bar-left';

    this.backBtn = new BigButton({
      icon: '🎪',
      text: 'Menú Principal',
      color: 'sky',
      ariaLabel: 'Volver al menú principal del circo',
      className: 'btn-back-to-menu pulse-gentle',
      onClick: () => {
        if (this.onBackToMapCallback) {
          this.onBackToMapCallback();
        }
      },
    });

    // Oculto por defecto si estamos en el mapa, visible si estamos en un juego
    if (!options.showMapButton) {
      this.backBtn.getElement().style.display = 'none';
    }
    leftContainer.appendChild(this.backBtn.getElement());

    this.profileBadgeSpan = document.createElement('div');
    this.profileBadgeSpan.className = 'timer-badge pulse-gentle';
    this.profileBadgeSpan.style.cursor = 'pointer';
    this.profileBadgeSpan.title = 'Toca para cambiar de perfil con tu código de 6 dígitos';
    this.profileBadgeSpan.textContent = '👤 ...';
    this.profileBadgeSpan.addEventListener('click', async () => {
      const code = prompt('Ingresa tu código de 6 dígitos para cargar tu perfil:');
      if (code) {
        const found = await progressService.getProfileByCode(code.trim());
        if (found) {
          await progressService.setActiveProfile(found.id);
          await this.refresh();
          speechService.speak(`¡Bienvenido de nuevo, ${found.name}!`);
        } else {
          alert('Código no encontrado. Consulta con tu maestro o en el Panel de Adultos.');
        }
      }
    });
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

  public setBackToMapVisible(visible: boolean, label: string = 'Menú Principal'): void {
    if (this.backBtn) {
      this.backBtn.getElement().style.display = visible ? 'inline-flex' : 'none';
      const textEl = this.backBtn.getElement().querySelector('.btn-text');
      if (textEl) textEl.textContent = label;
    }
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
