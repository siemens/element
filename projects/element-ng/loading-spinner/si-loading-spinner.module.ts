/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiLoadingSpinnerComponent } from './si-loading-spinner.component';
import { SiLoadingSpinnerDirective } from './si-loading-spinner.directive';

@NgModule({
  imports: [SiLoadingSpinnerComponent, SiLoadingSpinnerDirective],
  exports: [SiLoadingSpinnerComponent, SiLoadingSpinnerDirective]
})
export class SiLoadingSpinnerModule {}
