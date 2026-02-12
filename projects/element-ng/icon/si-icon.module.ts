/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiIconLegacyComponent } from './si-icon-legacy.component';
import { SiIconComponent } from './si-icon.component';

@NgModule({
  imports: [SiIconComponent, SiIconLegacyComponent],
  exports: [SiIconComponent, SiIconLegacyComponent]
})
export class SiIconModule {}
