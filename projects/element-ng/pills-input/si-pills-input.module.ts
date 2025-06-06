/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiPillsInputCsvDirective } from './si-pills-input-csv.directive';
import { SiPillsInputEmailDirective } from './si-pills-input-email.directive';
import { SiPillsInputComponent } from './si-pills-input.component';

@NgModule({
  exports: [SiPillsInputComponent, SiPillsInputCsvDirective, SiPillsInputEmailDirective],
  imports: [SiPillsInputComponent, SiPillsInputCsvDirective, SiPillsInputEmailDirective]
})
export class SiPillsInputModule {}
