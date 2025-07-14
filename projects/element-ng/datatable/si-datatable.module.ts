/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiDatatableInteractionDirective } from './si-datatable-interaction.directive';

@NgModule({
  imports: [SiDatatableInteractionDirective],
  exports: [SiDatatableInteractionDirective]
})
export class SiDatatableModule {}
