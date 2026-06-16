/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiAccordionAriaComponent, SiCollapsiblePanelAriaComponent } from '@siemens/element-ng/accordion-with-aria';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent,  SiAccordionAriaComponent, SiCollapsiblePanelAriaComponent],
  templateUrl: './si-accordion.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
