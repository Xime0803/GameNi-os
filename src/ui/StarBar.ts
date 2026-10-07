import { audioService } from '../core/audioService';
import { progressService } from '../core/progressService';
import { speechService } from '../core/speechService';

export interface StarBarOptions {
  onBackToMap?: () => void;
  showMapButton?: boolean;
}

export class StarBar {
  private element: HTMLElement;
  private backBtn: HTMLButtonElement;
  private gameBadge: HTMLElement;
  private profileBadgeSpan: HTMLElement;
  private starCountSpan: HTMLElement;
  private muteBtn: HTMLButtonElement;
  private onBackToMapCallback?: () => void;

  constructor(options: StarBarOptions = {}) {
    this.onBackToMapCallback = options.onBackToMap;
    this.element = document.createElement('header');
    this.element.className = 'top-bar';

    // 1. Lado Izquierdo: Botón "Sala Principal" + Insignia del Juego Activo
    const leftContainer = document.createElement('div');
    leftContainer.className = 'top-bar-left';

    this.backBtn = document.createElement('button');
    this.backBtn.className = 'top-nav-back';
    this.backBtn.id = 'btn-back-to-hall';
    this.backBtn.setAttribute('aria-label', 'Regresar a la Sala Principal');
    this.backBtn.innerHTML = `
      <span class="nav-icon">⬅️</span>
      <span class="nav-text">Sala Principal</span>
    `;
    this.backBtn.style.display = options.showMapButton ? 'inline-flex' : 'none';
    this.backBtn.addEventListener('click', () => {
      audioService.playClick();
      if (this.onBackToMapCallback) {
        this.onBackToMapCallback();
      }
    });
    leftContainer.appendChild(this.backBtn);

    this.gameBadge = document.createElement('div');
    this.gameBadge.className = 'top-nav-game-badge';
    this.gameBadge.id = 'top-nav-game-badge';
    this.gameBadge.style.display = 'none';
    leftContainer.appendChild(this.gameBadge);

    // 2. Centro: Contador de Estrellas Doradas
    const centerContainer = document.createElement('div');
    centerContainer.className = 'top-bar-center';

    const starsPill = document.createElement('div');
    starsPill.className = 'top-nav-stars-badge';
    starsPill.setAttribute('aria-label', 'Estrellas acumuladas');
    starsPill.innerHTML = `
      <span>⭐</span>
      <span id="star-count-num">0</span>
    `;
    this.starCountSpan = starsPill.querySelector('#star-count-num') as HTMLElement;
    centerContainer.appendChild(starsPill);

    // 3. Lado Derecho: Perfil del Niño + Silencio + Panel de Adultos
    const rightContainer = document.createElement('div');
    rightContainer.className = 'top-bar-right';

    this.profileBadgeSpan = document.createElement('button');
    this.profileBadgeSpan.className = 'top-nav-profile-badge';
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
          alert('Código no encontrado. Consulta con tu docente o en el Panel de Adultos.');
        }
      }
    });
    rightContainer.appendChild(this.profileBadgeSpan);

    this.muteBtn = document.createElement('button');
    this.muteBtn.className = 'top-nav-mute-btn';
    this.muteBtn.setAttribute('aria-label', 'Silenciar o activar sonidos');
    this.muteBtn.innerHTML = '<span class="mute-icon">🔊</span>';
    this.muteBtn.addEventListener('click', () => this.toggleSound());
    rightContainer.appendChild(this.muteBtn);

    const adultPanelBtn = document.createElement('a');
    adultPanelBtn.href = './panel.html';
    adultPanelBtn.className = 'top-nav-adult-btn';
    adultPanelBtn.setAttribute('aria-label', 'Acceder al panel de adultos y gestión');
    adultPanelBtn.innerHTML = `
      <span>🔒</span>
      <span>Adultos</span>
    `;
    rightContainer.appendChild(adultPanelBtn);

    this.element.appendChild(leftContainer);
    this.element.appendChild(centerContainer);
    this.element.appendChild(rightContainer);

    this.refresh();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public setBackToMapVisible(visible: boolean, label: string = 'Sala Principal'): void {
    if (this.backBtn) {
      this.backBtn.style.display = visible ? 'inline-flex' : 'none';
      const textEl = this.backBtn.querySelector('.nav-text');
      if (textEl) textEl.textContent = label.replace(/^⬅️\s*/, '');
    }
  }

  public setActiveGame(gameTitle: string | null): void {
    if (this.gameBadge) {
      if (gameTitle) {
        this.gameBadge.textContent = `🎪 ${gameTitle}`;
        this.gameBadge.style.display = 'inline-flex';
      } else {
        this.gameBadge.style.display = 'none';
      }
    }
  }

  public async refresh(): Promise<void> {
    const rewards = await progressService.getRewardState();
    if (this.starCountSpan) {
      this.starCountSpan.textContent = rewards.totalStars.toString();
    }

    const profile = await progressService.getActiveProfile();
    if (this.profileBadgeSpan) {
      this.profileBadgeSpan.textContent = `${profile.avatar} ${profile.name}`;
    }
  }

  private toggleSound(): void {
    const currentMuted = audioService.getMuted();
    const newMuted = !currentMuted;
    audioService.setMuted(newMuted);
    speechService.setMuted(newMuted);
    const icon = this.muteBtn.querySelector('.mute-icon');
    if (icon) {
      icon.textContent = newMuted ? '🔇' : '🔊';
    }
  }
}
