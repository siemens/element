/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiPasswordStrengthComponent } from './si-password-strength.component';
import { SiPasswordStrengthDirective } from './si-password-strength.directive';

@NgModule({
  imports: [SiPasswordStrengthComponent, SiPasswordStrengthDirective],
  exports: [SiPasswordStrengthComponent, SiPasswordStrengthDirective]
})
export class SiPasswordStrengthModule {}
