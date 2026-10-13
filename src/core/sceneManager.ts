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
    this.contentContainer.style.overflowY = 'auto';
    this.contentContainer.style.overflowX = 'hidden';
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
    this.starBar.setActiveGame(null);
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

    // Barra de navegación profesional unificada (única barra superior)
    this.starBar.setBackToMapVisible(true, 'Sala Principal');
    this.starBar.setActiveGame(game.config.title);

    // Escenario de pantalla completa para el mini-juego
    const gameStage = document.createElement('div');
    gameStage.className = 'game-scene-mount';
    gameStage.style.width = '100%';
    gameStage.style.height = '100%';
    gameStage.style.overflowY = 'auto';
    gameStage.style.overflowX = 'hidden';
    gameStage.style.position = 'relative';

    this.contentContainer.appendChild(gameStage);
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
      .game-scene-mount {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
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
