/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiTooltipDirective } from './si-tooltip.directive';

@NgModule({
  imports: [SiTooltipDirective],
  exports: [SiTooltipDirective]
})
export class SiTooltipModule {}
