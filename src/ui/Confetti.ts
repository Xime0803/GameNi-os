export class ConfettiCelebration {
  public static trigger(durationMs: number = 3000): void {
    if (typeof window === 'undefined') return;

    // Respetar prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B983FF', '#FF8FA3'];
    const count = 55;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 12 + 8;
      const left = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 2 + 1.8;

      piece.style.position = 'absolute';
      piece.style.top = '-20px';
      piece.style.left = `${left}vw`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 0.8}px`;
      piece.style.backgroundColor = color;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      piece.style.opacity = '0.9';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.transition = `top ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform ${duration}s linear ${delay}s, opacity ${duration}s ease-in ${delay}s`;

      container.appendChild(piece);

      setTimeout(() => {
        piece.style.top = '105vh';
        piece.style.transform = `rotate(${Math.random() * 1080 - 540}deg) translateX(${Math.random() * 100 - 50}px)`;
        piece.style.opacity = '0';
      }, 50);
    }

    setTimeout(() => {
      container.remove();
    }, durationMs + 800);
  }
}
