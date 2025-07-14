/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiIconModule } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-card-selectable.html',
  styles: `
    .card-size {
      height: 250px;
    }
  `,
  imports: [SiCardComponent, SiIconModule]
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
