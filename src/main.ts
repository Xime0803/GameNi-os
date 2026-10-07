import { ALL_GAMES } from './games';
import { audioService } from './core/audioService';
import { progressService } from './core/progressService';
import { SceneManager } from './core/sceneManager';
import { speechService } from './core/speechService';
import './styles/base.css';
import './styles/kid-theme.css';

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('app');
  if (!root) return;

  // Cargar configuraciones guardadas (velocidad de voz, etc.)
  const settings = await progressService.getSettings();
  speechService.setSpeed(settings.voiceSpeed);

  // Desbloqueo universal instantáneo de AudioContext y SpeechSynthesis al primer toque (política del navegador)
  const unlockAudioPipeline = () => {
    speechService.prewarm();
    audioService.unlock(); // Despierta el AudioContext de Web Audio
    if (settings.musicEnabled) {
      audioService.startBackgroundMusic();
    }
    window.removeEventListener('pointerdown', unlockAudioPipeline);
    window.removeEventListener('touchstart', unlockAudioPipeline);
  };
  window.addEventListener('pointerdown', unlockAudioPipeline, { passive: true });
  window.addEventListener('touchstart', unlockAudioPipeline, { passive: true });

  // Iniciar SceneManager con el elenco completo de los 10 mini-juegos
  const sceneManager = new SceneManager(root, ALL_GAMES);
  sceneManager.showMap();

  // Monitoreo de límite de tiempo diario saludable
  setInterval(async () => {
    const activeSettings = await progressService.getSettings();
    const limitMinutes = activeSettings.dailyTimeLimitMinutes;
    if (limitMinutes > 0) {
      const playedMs = await progressService.getUsageTimeTodayMs();
      if (playedMs >= limitMinutes * 60 * 1000) {
        showTimeLimitNotice();
      }
    }
  }, 30000); // Chequeo cada 30 segundos
});

function showTimeLimitNotice(): void {
  if (document.getElementById('time-limit-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'time-limit-modal';
  modal.className = 'celebration-modal-overlay';
  modal.innerHTML = `
    <div class="celebration-card" style="border-color: var(--color-sky);">
      <div style="font-size: 50px;">🌅 🧸</div>
      <h2 style="color: #0369A1; margin-top: 10px;">¡Tiempo de jugar en casa!</h2>
      <p style="font-size: 18px; color: #4B5563; margin: 16px 0;">
        ¡Hiciste un trabajo increíble hoy en el circo! Es momento de descansar los ojitos, abrazar a mamá o papá y jugar con tus juguetes.
      </p>
      <button id="btn-limit-close" class="btn-big btn-sky pulse-gentle">
        ¡Hasta mañana, circo!
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  speechService.speak(
    '¡Gran trabajo por hoy! Cumpliste tu tiempo de juego. Es momento de descansar y jugar con tu familia.'
  );

  document.getElementById('btn-limit-close')?.addEventListener('click', () => {
    modal.remove();
  });
}
