/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SiActionCardComponent } from '@siemens/element-ng/card';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { LOG_EVENT, provideExampleRoutes } from '@siemens/live-preview';

@Component({
  template: '<p class="mb-0">Energy report opened using Angular routing.</p>'
})
export class EnergyReportComponent {}

@Component({
  selector: 'app-sample',
  imports: [RouterLink, RouterOutlet, SiActionCardComponent, SiIconComponent],
  templateUrl: './si-action-card.html',
  styles: `
    .card {
      inline-size: 100%;
      block-size: 100%;
    }
  `,
  providers: [provideExampleRoutes([{ path: 'energy-report', component: EnergyReportComponent }])]
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
