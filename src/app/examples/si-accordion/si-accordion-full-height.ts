/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';

@Component({
  selector: 'app-sample',
  templateUrl: './si-accordion-full-height.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent]
})
export class SampleComponent {
  moreContent = false;
}
