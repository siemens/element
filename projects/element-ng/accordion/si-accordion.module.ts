/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiAccordionComponent } from './si-accordion.component';
import { SiCollapsiblePanelComponent } from './si-collapsible-panel.component';

@NgModule({
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent],
  exports: [SiAccordionComponent, SiCollapsiblePanelComponent]
})
export class SiAccordionModule {}
