/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiPopoverDirective } from './si-popover.directive';

@NgModule({
  imports: [SiPopoverDirective],
  exports: [SiPopoverDirective]
})
export class SiPopoverModule {}
