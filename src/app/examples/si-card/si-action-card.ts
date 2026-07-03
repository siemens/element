/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiActionCardComponent } from '@siemens/element-ng/card';
import { SiIconModule } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiActionCardComponent, SiIconModule],
  templateUrl: './si-action-card.html',
  styles: `
    .card {
      inline-size: 100%;
      block-size: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private readonly log = inject(LOG_EVENT);

  protected onCardClick(cardId: string): void {
    this.log('Card clicked:', cardId);
  }

  protected onCardSelect(state: boolean, cardId: string): void {
    if (state) {
      this.log('Card selected:', cardId);
    } else {
      this.log('Card deselected:', cardId);
    }
  }
}
