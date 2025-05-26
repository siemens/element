/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-accordion.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
