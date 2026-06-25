/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox } from '@angular/aria/combobox';
import { Directive, inject, model, signal } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';

@Directive({
  selector: 'input[siAutocomplete]',
  hostDirectives: [
    {
      directive: Combobox,
      inputs: [
        'disabled',
        'softDisabled',
        'alwaysExpanded',
        'tabindex',
        'expanded',
        'value',
        'inlineSuggestion'
      ]
    }
  ],
  exportAs: 'siAutocomplete'
})
export class SiAutocompleteDirective<T> {
  /** @defaultValue '' */
  readonly value = model();
  /** @defaultValue false */
  readonly expanded = model(false);
  readonly combobox = inject(Combobox);
}
