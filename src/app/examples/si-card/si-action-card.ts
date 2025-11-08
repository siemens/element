/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SiActionCardComponent } from '@siemens/element-ng/card';
import { SiIconModule } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiActionCardComponent, SiIconModule],
  templateUrl: './si-action-card.html',
  styles: `
    .card-size {
      height: 250px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private log = inject(LOG_EVENT);
  protected onCardSelect(state: boolean, cardId: string): void {
    if (state) {
      this.log('Card selected:', cardId);
    } else {
      this.log('Card deselected:', cardId);
    }
  }
}
