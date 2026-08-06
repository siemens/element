import { Component } from '@angular/core';

@Component({
  selector: 'si-feedback-migration',
  template: `
    <div
      style="--si-feedback-icon-size: 1rem"
      [style.--si-feedback-icon-size]="iconOffset"
      [style.--si-feedback-icon-offset-extra]="iconOffset"
    ></div>
  `,
  host: {
    '[style.--si-feedback-icon-size]': 'iconOffset'
  },
  styles: `
    :host {
      --si-feedback-icon-size: 1rem;
      inline-size: var(--si-feedback-icon-size);
      --si-feedback-icon-offset-extra: 2rem;
    }
  `
})
export class FeedbackMigrationComponent {
  protected readonly iconOffset = '1rem';

  setIconOffset(element: HTMLElement): void {
    element.style.setProperty('--si-feedback-icon-size', this.iconOffset);
  }

  getIconOffset(fallback: string): string {
    return `var(--si-feedback-icon-size, ${fallback})`;
  }
}
