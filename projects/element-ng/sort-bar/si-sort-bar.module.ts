/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiSortBarComponent } from './si-sort-bar.component';

/**
 * @deprecated SiSortBarModule originate from the older design system and do not align with current
 * design guidelines. No known use case exists for this module and component.
 * It will be removed in v50.
 */
@NgModule({
  imports: [SiSortBarComponent],
  exports: [SiSortBarComponent]
})
export class SiSortBarModule {}
