/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';
import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';
import { SiAutocompleteDirective } from './si-autocomplete.directive';

@NgModule({
  declarations: [],
  imports: [SiAutocompleteDirective, SiAutocompleteListboxDirective, SiAutocompleteOptionDirective],
  exports: [SiAutocompleteDirective, SiAutocompleteListboxDirective, SiAutocompleteOptionDirective]
})
export class SiAutocompleteModule {}
