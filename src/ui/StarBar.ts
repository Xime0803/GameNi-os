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
    this.profileBadgeSpan.addEventListener('click', () => {
      audioService.playClick();
      this.openProfileSwitcher();
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

  private async openProfileSwitcher(): Promise<void> {
    const existingModal = document.getElementById('profile-switcher-modal');
    if (existingModal) existingModal.remove();

    const profiles = await progressService.getProfiles();
    const currentActive = await progressService.getActiveProfile();

    const overlay = document.createElement('div');
    overlay.id = 'profile-switcher-modal';
    overlay.className = 'celebration-modal-overlay';
    overlay.style.zIndex = '9999';

    overlay.innerHTML = `
      <div class="celebration-card" style="max-width: 520px; padding: 24px 28px; border-radius: 28px; border: 4px solid var(--color-sun); text-align: center;">
        <div style="font-size: 38px; margin-bottom: 6px;">🎒 🎪</div>
        <h2 style="font-size: 26px; color: #1E293B; margin-bottom: 4px;">¿Quién está jugando?</h2>
        <p style="font-size: 15px; color: #64748B; margin-bottom: 20px;">
          Toca tu perfil o ingresa tu código de 6 dígitos
        </p>

        <!-- Cuadrícula de perfiles registrados -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 22px; max-height: 240px; overflow-y: auto; padding: 4px;">
          ${profiles
            .map(
              (p) => `
            <button class="profile-card-btn ${p.id === currentActive.id ? 'active' : ''}" data-id="${p.id}" style="
              background: ${p.id === currentActive.id ? '#FEF3C7' : '#F8FAFC'};
              border: 2px solid ${p.id === currentActive.id ? '#F59E0B' : '#E2E8F0'};
              border-radius: 18px;
              padding: 12px 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              cursor: pointer;
              transition: transform 0.15s, border-color 0.15s;
            ">
              <span style="font-size: 32px;">${p.avatar}</span>
              <span style="font-size: 15px; font-weight: 700; color: #1E293B;">${p.name}</span>
              <span style="font-size: 11px; color: #64748B; font-weight: 600;">Cód: ${p.accessCode}</span>
              ${
                p.id === currentActive.id
                  ? '<span style="font-size: 10px; background: #10B981; color: #FFF; padding: 2px 8px; border-radius: 9999px; font-weight: 800; margin-top: 2px;">ACTIVO</span>'
                  : ''
              }
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Entrada rápida con código de 6 dígitos -->
        <div style="background: #F1F5F9; border-radius: 18px; padding: 14px; margin-bottom: 18px;">
          <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px;">O escribe tu código único de 6 dígitos:</div>
          <div style="display: flex; gap: 8px; justify-content: center;">
            <input id="profile-pin-input" type="text" maxlength="6" placeholder="000000" inputmode="numeric" style="
              width: 140px;
              padding: 8px 12px;
              font-size: 20px;
              font-weight: 800;
              letter-spacing: 4px;
              text-align: center;
              border: 2px solid #CBD5E1;
              border-radius: 12px;
              outline: none;
            " />
            <button id="profile-pin-submit" class="btn-primary" style="padding: 8px 16px; font-size: 14px; border-radius: 12px; font-weight: 700;">
              ✨ Entrar
            </button>
          </div>
          <div id="profile-pin-error" style="color: #DC2626; font-size: 12px; font-weight: 600; margin-top: 6px; display: none;"></div>
        </div>

        <button id="profile-modal-close" style="
          background: #E2E8F0;
          color: #475569;
          border: none;
          border-radius: 9999px;
          padding: 8px 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        ">
          ✖️ Cerrar
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.profile-card-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          await progressService.setActiveProfile(id);
          const active = await progressService.getActiveProfile();
          audioService.playSuccess();
          speechService.speak(`¡Hola de nuevo, ${active.name}!`);
          await this.refresh();
          overlay.remove();
        }
      });
    });

    const pinInput = overlay.querySelector('#profile-pin-input') as HTMLInputElement;
    const pinSubmit = overlay.querySelector('#profile-pin-submit') as HTMLButtonElement;
    const pinError = overlay.querySelector('#profile-pin-error') as HTMLElement;

    const handlePin = async () => {
      const code = pinInput.value.trim();
      if (!code) return;
      const found = await progressService.getProfileByCode(code);
      if (found) {
        await progressService.setActiveProfile(found.id);
        audioService.playSuccess();
        speechService.speak(`¡Bienvenido, ${found.name}!`);
        await this.refresh();
        overlay.remove();
      } else {
        audioService.playGentleHint();
        pinError.textContent = '⚠️ Código no encontrado. Revisa los 6 dígitos.';
        pinError.style.display = 'block';
        pinInput.style.borderColor = '#EF4444';
        setTimeout(() => {
          pinInput.style.borderColor = '#CBD5E1';
        }, 2000);
      }
    };

    pinSubmit.addEventListener('click', handlePin);
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlePin();
    });

    overlay.querySelector('#profile-modal-close')?.addEventListener('click', () => {
      audioService.playClick();
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }
}
