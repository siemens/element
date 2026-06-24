/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiAccordionAriaComponent,
  SiCollapsiblePanelAriaComponent
} from '@siemens/element-ng/accordion-with-aria';

@Component({
  selector: 'app-sample',
  imports: [
    SiAccordionComponent,
    SiCollapsiblePanelComponent,
    SiAccordionAriaComponent,
    SiCollapsiblePanelAriaComponent
  ],
  templateUrl: './si-accordion-full-height.html'
})
export class SampleComponent {
  moreContent = false;
}
