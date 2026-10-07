import { audioService } from '../core/audioService';

export interface BigButtonOptions {
  text?: string;
  icon?: string;
  color?: 'coral' | 'sun' | 'leaf' | 'sky' | 'lavender';
  ariaLabel: string;
  className?: string;
  onClick: () => void;
}

export class BigButton {
  private element: HTMLButtonElement;

  constructor(options: BigButtonOptions) {
    this.element = document.createElement('button');
    this.element.className = `btn-big btn-${options.color || 'coral'} ${options.className || ''}`;
    this.element.setAttribute('aria-label', options.ariaLabel);

    if (options.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'btn-icon';
      iconSpan.textContent = options.icon;
      this.element.appendChild(iconSpan);
    }

    if (options.text) {
      const textSpan = document.createElement('span');
      textSpan.className = 'btn-text';
      textSpan.textContent = options.text;
      this.element.appendChild(textSpan);
    }

    this.element.addEventListener('pointerdown', () => {
      audioService.playClick();
    });

    this.element.addEventListener('click', () => {
      options.onClick();
    });
  }

  public getElement(): HTMLButtonElement {
    return this.element;
  }

  public setDisabled(disabled: boolean): void {
    this.element.disabled = disabled;
    this.element.style.opacity = disabled ? '0.5' : '1';
    this.element.style.pointerEvents = disabled ? 'none' : 'auto';
  }
}
