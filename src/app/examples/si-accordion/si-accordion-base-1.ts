/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  SiAccordionComponent,
  SiCollapsiblePanelComponent
} from '@spike-rabbit/element-ng/accordion';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent],
  templateUrl: './si-accordion-base-1.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
