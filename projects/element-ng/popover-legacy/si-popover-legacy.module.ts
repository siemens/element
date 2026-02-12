/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiPopoverLegacyDirective } from './si-popover-legacy.directive';

/**
 * @deprecated Use {@link SiPopoverDirective} instead.
 */
@NgModule({
  imports: [SiPopoverLegacyDirective],
  exports: [SiPopoverLegacyDirective]
})
export class SiPopoverLegacyModule {}
