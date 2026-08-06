import { Component } from '@angular/core';

@Component({
  selector: 'si-feedback-migration',
  template: `
    <div
      style="--si-feedback-icon-offset: 1rem"
      [style.--si-feedback-icon-offset]="iconOffset"
      [style.--si-feedback-icon-offset-extra]="iconOffset"
    ></div>
  `,
  host: {
    '[style.--si-feedback-icon-offset]': 'iconOffset'
  },
  styles: `
    :host {
      --si-feedback-icon-offset: 1rem;
      inline-size: var(--si-feedback-icon-offset);
      --si-feedback-icon-offset-extra: 2rem;
    }
  `
})
export class FeedbackMigrationComponent {
  protected readonly iconOffset = '1rem';

  setIconOffset(element: HTMLElement): void {
    element.style.setProperty('--si-feedback-icon-offset', this.iconOffset);
  }

  getIconOffset(fallback: string): string {
    return `var(--si-feedback-icon-offset, ${fallback})`;
  }
}
