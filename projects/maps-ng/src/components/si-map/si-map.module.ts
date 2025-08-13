/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiMapPopoverComponent } from './components/si-map-popover/si-map-popover.component';
import { SiMapTooltipComponent } from './components/si-map-tooltip/si-map-tooltip.component';
import { SiMapComponent } from './si-map.component';

@NgModule({
  imports: [SiMapComponent, SiMapPopoverComponent, SiMapTooltipComponent],
  exports: [SiMapComponent]
})
export class SiMapModule {}
