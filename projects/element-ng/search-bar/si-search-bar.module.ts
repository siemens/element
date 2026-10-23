/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiSearchBarInputDirective } from './si-search-bar-input.directive';
import { SiSearchBarComponent } from './si-search-bar.component';

@NgModule({
  imports: [SiSearchBarComponent, SiSearchBarInputDirective],
  exports: [SiSearchBarComponent, SiSearchBarInputDirective]
})
export class SiSearchBarModule {}
