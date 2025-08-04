/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';
import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';
import { SiAutocompleteDirective } from './si-autocomplete.directive';

@NgModule({
  imports: [SiAutocompleteDirective, SiAutocompleteListboxDirective, SiAutocompleteOptionDirective],
  declarations: [],
  exports: [SiAutocompleteDirective, SiAutocompleteListboxDirective, SiAutocompleteOptionDirective]
})
export class SiAutocompleteModule {}
