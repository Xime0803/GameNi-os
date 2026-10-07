import { ConfettiCelebration } from '../ui/Confetti';
import { MapScreen } from '../ui/MapScreen';
import { StarBar } from '../ui/StarBar';
import { XimenitaComponent } from '../ui/Ximenita';
import { audioService } from './audioService';
import { progressService } from './progressService';
import { MiniGame, MiniGameSessionResult } from './types';

export class SceneManager {
  private rootElement: HTMLElement;
  private starBar: StarBar;
  private mapScreen: MapScreen;
  private games: Map<string, MiniGame> = new Map();
  private currentGame: MiniGame | null = null;
  private contentContainer: HTMLElement;

  constructor(rootElement: HTMLElement, gamesList: MiniGame[]) {
    this.rootElement = rootElement;
    this.rootElement.innerHTML = '';

    gamesList.forEach((g) => this.games.set(g.config.id, g));

    this.starBar = new StarBar({
      showMapButton: false,
      onBackToMap: () => this.showMap(),
    });
    this.rootElement.appendChild(this.starBar.getElement());

    this.contentContainer = document.createElement('main');
    this.contentContainer.className = 'scene-content-area';
    this.contentContainer.style.flex = '1';
    this.contentContainer.style.overflow = 'hidden';
    this.contentContainer.style.position = 'relative';
    this.rootElement.appendChild(this.contentContainer);

    this.mapScreen = new MapScreen(gamesList, (gameId) => this.launchGame(gameId));
  }

  public showMap(): void {
    if (this.currentGame) {
      this.currentGame.unmount();
      this.currentGame = null;
    }
    this.starBar.setBackToMapVisible(false);
    this.starBar.refresh();
    this.mapScreen.render(this.contentContainer);
  }

  public async launchGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) {
      console.warn(`Juego no encontrado: ${gameId}`);
      return;
    }

    if (this.currentGame) {
      this.currentGame.unmount();
    }

    this.currentGame = game;
    this.contentContainer.innerHTML = '';

    // Actualizar barra de estado superior
    this.starBar.setBackToMapVisible(true, '⬅️ Regresar al Panel Principal');

    const gameWrapper = document.createElement('div');
    gameWrapper.className = 'game-scene-wrapper';
    gameWrapper.style.width = '100%';
    gameWrapper.style.height = '100%';
    gameWrapper.style.display = 'flex';
    gameWrapper.style.flexDirection = 'column';
    gameWrapper.style.position = 'relative';

    // Barra de navegación permanente y destacada (NUNCA sobrescrita por el juego)
    const navBar = document.createElement('div');
    navBar.className = 'game-nav-bar-persistent';
    navBar.innerHTML = `
      <button class="btn-return-main-panel" id="btn-scene-back-main" aria-label="Regresar al panel principal del circo">
        <span class="back-btn-icon">⬅️</span>
        <span class="back-btn-text">Regresar al Panel Principal</span>
      </button>
      <div class="game-nav-info-group">
        <span class="game-title-badge">🎪 ${game.config.title}</span>
        <a href="./panel.html" class="btn-nav-adults-link" aria-label="Ir al Panel de Adultos y Gestión">
          <span>🔒 Panel de Adultos</span>
        </a>
      </div>
    `;

    navBar.querySelector('#btn-scene-back-main')?.addEventListener('click', () => {
      audioService.playClick();
      this.showMap();
    });

    // Escenario aislado donde se renderiza el juego (evita que el innerHTML del juego destruya la navegación)
    const gameStage = document.createElement('div');
    gameStage.className = 'game-stage-mount';
    gameStage.style.flex = '1';
    gameStage.style.width = '100%';
    gameStage.style.height = '100%';
    gameStage.style.overflow = 'hidden';
    gameStage.style.position = 'relative';

    gameWrapper.appendChild(navBar);
    gameWrapper.appendChild(gameStage);
    this.contentContainer.appendChild(gameWrapper);
    this.injectSceneStylesOnce();

    await game.mount(gameStage, (result) => this.handleGameComplete(result));
  }

  private async handleGameComplete(result: MiniGameSessionResult): Promise<void> {
    // 1. Guardar en progressService
    await progressService.record({
      gameId: result.gameId,
      level: result.finalLevel,
      hits: result.hits,
      misses: result.misses,
      timeMs: result.timeSpentMs,
      finishedAt: Date.now(),
      skillWorked: result.skillWorked,
      area: result.area,
    });

    // 2. Efectos audiovisuales de recompensa
    audioService.playCheer();
    audioService.playStar();
    ConfettiCelebration.trigger(3500);

    // 3. Modal de celebración con Ximenita
    const modal = document.createElement('div');
    modal.className = 'celebration-modal-overlay';
    modal.innerHTML = `
      <div class="celebration-card">
        <div class="celebration-stars">⭐⭐⭐</div>
        <h2>¡Lo lograste!</h2>
        <p class="celebration-subtitle">¡Completaste esta ronda del circo!</p>
        <div class="celebration-stats">
          <div class="stat-pill">🎯 Aciertos: <strong>${result.hits}</strong></div>
          <div class="stat-pill">🏆 Nivel: <strong>${result.finalLevel}</strong></div>
        </div>
        <button class="btn-big btn-sun btn-continue pulse-gentle">
          🎪 ¡Volver al Menú Principal!
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const ximenita = new XimenitaComponent('default');
    const ximenitaSlot = modal.querySelector('.celebration-card');
    if (ximenitaSlot) {
      ximenitaSlot.insertBefore(ximenita.getElement(), ximenitaSlot.querySelector('.btn-continue'));
    }

    ximenita.celebrate('¡Excelente, lo hiciste muy bien!');

    modal.querySelector('.btn-continue')?.addEventListener('click', () => {
      audioService.playClick();
      modal.remove();
      this.showMap();
    });

    this.injectModalStylesOnce();
  }

  private injectSceneStylesOnce(): void {
    if (document.getElementById('scene-manager-styles')) return;

    const style = document.createElement('style');
    style.id = 'scene-manager-styles';
    style.textContent = `
      .game-nav-bar-persistent {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 20px;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(10px);
        border-bottom: 3px solid #BAE6FD;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        z-index: 100;
        flex-shrink: 0;
      }

      .btn-return-main-panel {
        background: linear-gradient(135deg, #0284C7, #0369A1);
        color: #FFFFFF;
        border: 2px solid #BAE6FD;
        border-radius: 9999px;
        padding: 8px 20px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        font-family: inherit;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      }

      .btn-return-main-panel:hover {
        transform: scale(1.04);
        background: linear-gradient(135deg, #0369A1, #075985);
        box-shadow: 0 6px 16px rgba(2, 132, 199, 0.45);
      }

      .btn-return-main-panel:active {
        transform: scale(0.96);
      }

      .back-btn-icon {
        font-size: 20px;
      }

      .back-btn-text {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.3px;
      }

      .game-nav-info-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .game-title-badge {
        background: #F0F9FF;
        color: #0369A1;
        border: 2px solid #BAE6FD;
        border-radius: 9999px;
        padding: 6px 16px;
        font-size: 15px;
        font-weight: 700;
      }

      .btn-nav-adults-link {
        background: #F3E8FF;
        color: #7E22CE;
        border: 2px solid #D8B4FE;
        border-radius: 9999px;
        padding: 6px 14px;
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: background 0.15s ease, transform 0.15s ease;
      }

      .btn-nav-adults-link:hover {
        background: #E9D5FF;
        transform: scale(1.04);
      }
    `;
    document.head.appendChild(style);
  }

  private injectModalStylesOnce(): void {
    if (document.getElementById('celebration-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'celebration-modal-styles';
    style.textContent = `
      .celebration-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
      }

      .celebration-card {
        background: #FFFFFF;
        border-radius: var(--radius-lg);
        padding: 36px 40px;
        max-width: 480px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border: 6px solid var(--color-sun);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }

      .celebration-stars {
        font-size: 54px;
        margin-bottom: 8px;
        animation: pulseGentle 1.5s infinite;
      }

      .celebration-card h2 {
        font-size: 34px;
        color: #B45309;
        margin-bottom: 8px;
      }

      .celebration-subtitle {
        font-size: 20px;
        color: #4B5563;
        margin-bottom: 20px;
      }

      .celebration-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-pill {
        background: #FEF3C7;
        color: #92400E;
        padding: 8px 18px;
        border-radius: var(--radius-full);
        font-size: 18px;
        font-weight: 700;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}
