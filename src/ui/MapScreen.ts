import { CIRCUS_CAST } from '../config/circus';
import { progressService } from '../core/progressService';
import { rewardService } from '../core/rewardService';
import { MiniGame } from '../core/types';
import { XimenitaComponent } from './Ximenita';

export class MapScreen {
  private container: HTMLElement;
  private games: MiniGame[];
  private onSelectGame: (gameId: string) => void;
  private ximenita: XimenitaComponent;

  constructor(games: MiniGame[], onSelectGame: (gameId: string) => void) {
    this.games = games;
    this.onSelectGame = onSelectGame;
    this.container = document.createElement('div');
    this.container.className = 'map-screen-container';
    this.ximenita = new XimenitaComponent('default');
  }

  public async render(parent: HTMLElement): Promise<void> {
    parent.innerHTML = '';
    const rewards = await progressService.getRewardState();
    const circusInfo = rewardService.getCircusStageDetails(rewards.circusStageLevel);

    this.container.innerHTML = `
      <div class="circus-map-wrapper">
        <!-- Encabezado del Circo -->
        <div class="circus-banner">
          <div class="circus-tent-badge">
            <span class="tent-icon">🎪</span>
            <div class="tent-text">
              <h2>${circusInfo.title}</h2>
              <p>${circusInfo.description}</p>
            </div>
          </div>
          <div class="circus-decorations">
            ${circusInfo.decorations.map((d) => `<span class="dec-tag">${d}</span>`).join(' ')}
            <a href="./panel.html" class="circus-panel-quicklink" aria-label="Abrir Panel de Adultos y Gestión">
              <span>🔒 Panel de Padres y Maestros</span>
            </a>
          </div>
        </div>

        <!-- Cuadrícula de Atracciones del Circo (Los 10 Mini-Juegos) -->
        <div class="attractions-grid" role="region" aria-label="Atracciones del Circo">
          ${this.games
            .map((game) => {
              const char = CIRCUS_CAST[game.config.characterId] || CIRCUS_CAST.pomni;
              const emoji = this.emojiForGame(game.config.id);
              return `
                <div class="attraction-card" data-game-id="${game.config.id}" tabindex="0" role="button" aria-label="${game.config.title}, área de ${game.config.area}. Con ${char.name} el ${char.species}">
                  <div class="attraction-character-badge" style="background-color: ${char.primaryColor}22; border-color: ${char.primaryColor}">
                    <span class="char-avatar">${char.avatarEmoji}</span>
                    <span class="char-name">${char.name}</span>
                  </div>
                  <div class="attraction-icon-circle">
                    <span class="attraction-emoji">${emoji}</span>
                  </div>
                  <h3 class="attraction-title">${game.config.title}</h3>
                  <span class="attraction-area-pill area-${this.normalizeArea(game.config.area)}">${game.config.area}</span>
                  <p class="attraction-desc">${game.config.instruction}</p>
                </div>
              `;
            })
            .join('')}
        </div>

        <!-- Área de Ximenita -->
        <div class="map-ximenita-anchor"></div>
      </div>
    `;

    // Conectar eventos táctiles en las tarjetas de juego
    const cards = this.container.querySelectorAll('.attraction-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const gameId = card.getAttribute('data-game-id');
        if (gameId) {
          this.onSelectGame(gameId);
        }
      });
      card.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
          const gameId = card.getAttribute('data-game-id');
          if (gameId) {
            this.onSelectGame(gameId);
          }
        }
      });
    });

    // Añadir Ximenita
    const ximenitaAnchor = this.container.querySelector('.map-ximenita-anchor') as HTMLElement;
    if (ximenitaAnchor) {
      ximenitaAnchor.appendChild(this.ximenita.getElement());
    }

    parent.appendChild(this.container);
    this.injectStylesOnce();

    // Saludo de Ximenita al entrar al circo
    setTimeout(() => {
      this.ximenita.narrate(
        '¡Hola! Soy Ximenita. ¡Bienvenida y bienvenido a nuestro gran circo! Toca cualquier juego para divertirte y aprender con nuestros amigos animales.'
      );
    }, 450);
  }

  private emojiForGame(gameId: string): string {
    const emojis: Record<string, string> = {
      '01-cuenta-con-pomni': '🍌',
      '02-numeros-del-bosque': '🌲',
      '03-traza-los-numeros': '✍️',
      '04-vocales-animales': '🔤',
      '05-traza-las-vocales': '🎨',
      '06-memoria-animal': '🃏',
      '07-sumas-de-la-selva': '➕',
      '08-patrones-animales': '🚂',
      '09-donde-vive': '🏞️',
      '10-sonidos-animales': '🎶',
    };
    return emojis[gameId] || '🎪';
  }

  private normalizeArea(area: string): string {
    return area.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  }

  private injectStylesOnce(): void {
    if (document.getElementById('map-screen-styles')) return;

    const style = document.createElement('style');
    style.id = 'map-screen-styles';
    style.textContent = `
      .map-screen-container {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 16px 24px 100px;
        position: relative;
      }

      .circus-map-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .circus-banner {
        background: #FFFFFFEE;
        border-radius: var(--radius-lg);
        padding: 18px 26px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border: 4px solid var(--color-sun);
        box-shadow: var(--shadow-md);
      }

      .circus-tent-badge {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .tent-icon {
        font-size: 52px;
        animation: pulseGentle 3s infinite ease-in-out;
      }

      .tent-text h2 {
        font-size: 26px;
        color: #B45309;
      }

      .tent-text p {
        font-size: 16px;
        color: #4B5563;
      }

      .circus-decorations {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .dec-tag {
        background: #FEF3C7;
        color: #92400E;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        font-size: 15px;
        font-weight: 700;
      }

      .circus-panel-quicklink {
        background: #F3E8FF;
        color: #7E22CE;
        border: 2px solid #D8B4FE;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.15s ease, background 0.15s ease;
      }

      .circus-panel-quicklink:hover {
        background: #E9D5FF;
        transform: scale(1.05);
      }

      .attractions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
      }

      .attraction-card {
        background: #FFFFFFEE;
        border-radius: var(--radius-lg);
        padding: 22px 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: var(--shadow-bounce);
        cursor: pointer;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        border: 4px solid #F1F5F9;
        position: relative;
        overflow: hidden;
      }

      .attraction-card:hover, .attraction-card:focus-visible {
        transform: translateY(-8px) scale(1.02);
        box-shadow: var(--shadow-lg);
        border-color: var(--color-sky);
      }

      .attraction-card:active {
        transform: translateY(2px);
      }

      .attraction-character-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        border-width: 2px;
        border-style: solid;
        font-size: 13px;
        font-weight: 700;
      }

      .attraction-icon-circle {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFF9F0, #E8F4FF);
        border: 4px solid var(--color-coral);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 16px;
        margin-bottom: 12px;
        box-shadow: var(--shadow-sm);
      }

      .attraction-emoji {
        font-size: 44px;
      }

      .attraction-title {
        font-size: 22px;
        color: #1F2937;
        margin-bottom: 8px;
      }

      .attraction-area-pill {
        display: inline-block;
        padding: 4px 14px;
        border-radius: var(--radius-full);
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .area-numeros { background: #E0F2FE; color: #0369A1; }
      .area-escritura { background: #FEF3C7; color: #B45309; }
      .area-logica { background: #F3E8FF; color: #7E22CE; }
      .area-vocabulario-y-logica, .area-vocabulario { background: #DCFCE7; color: #15803D; }

      .attraction-desc {
        font-size: 15px;
        color: #4B5563;
        line-height: 1.35;
      }

      .map-ximenita-anchor {
        position: fixed;
        bottom: 16px;
        left: 24px;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }
}
