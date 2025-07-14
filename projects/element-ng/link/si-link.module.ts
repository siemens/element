/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiLinkDirective } from './si-link.directive';

@NgModule({
  imports: [SiLinkDirective],
  exports: [SiLinkDirective]
})
export class SiLinkModule {}
