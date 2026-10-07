export class InputService {
  public static preventZoomAndScroll(element: HTMLElement): () => void {
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    element.addEventListener('touchstart', handleTouch, { passive: false });
    element.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouch);
      element.removeEventListener('touchmove', handleTouch);
    };
  }

  public static addHapticFeedback(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Silencioso si no está permitido
      }
    }
  }
}
