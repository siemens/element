/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiAccordionAriaComponent } from './si-accordion.component';
import { SiCollapsiblePanelAriaComponent } from './si-collapsible-panel.component';

@NgModule({
  imports: [SiAccordionAriaComponent, SiCollapsiblePanelAriaComponent],
  exports: [SiAccordionAriaComponent, SiCollapsiblePanelAriaComponent]
})
export class SiAccordionModule {}
