/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiTooltipOverlayDirective } from './si-tooltip-overlay.directive';
import { SiTooltipDirective } from './si-tooltip.directive';

@NgModule({
  imports: [SiTooltipDirective, SiTooltipOverlayDirective],
  exports: [SiTooltipDirective, SiTooltipOverlayDirective]
})
export class SiTooltipModule {}
