/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent],
  templateUrl: './si-accordion.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
