/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiTypeaheadItemTemplateDirective } from './si-typeahead-item-template.directive';
import { SiTypeaheadDirective } from './si-typeahead.directive';

@NgModule({
  imports: [SiTypeaheadDirective, SiTypeaheadItemTemplateDirective],
  exports: [SiTypeaheadDirective, SiTypeaheadItemTemplateDirective]
})
export class SiTypeaheadModule {}
