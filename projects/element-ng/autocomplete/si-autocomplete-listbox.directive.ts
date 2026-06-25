/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Listbox } from '@angular/aria/listbox';
import { afterRenderEffect, Directive, inject, input, output } from '@angular/core';

import { SiAutocompleteDirective } from './si-autocomplete.directive';
import { AUTOCOMPLETE_LISTBOX } from './si-autocomplete.model';

@Directive({
  selector: '[siAutocompleteListboxFor]',
  providers: [{ provide: AUTOCOMPLETE_LISTBOX, useExisting: SiAutocompleteListboxDirective }],
  host: {
    '(click)': 'listboxClick()'
  },
  hostDirectives: [
    {
      directive: Listbox,
      inputs: [
        'id',
        'disabled',
        'orientation',
        'multi',
        'wrap',
        'softDisabled',
        'focusMode',
        'selectionMode',
        'typeaheadDelay',
        'readonly',
        'tabindex',
        'value'
      ],
      outputs: ['valueChange']
    }
  ],
  exportAs: 'siAutocompleteListbox'
})
export class SiAutocompleteListboxDirective<T> {
  /** @defaultValue inject(Listbox) */
  listbox = inject(Listbox);
  private static idCounter = 0;

  /**
   * @defaultValue
   * ```
   * `__si-autocomplete-listbox-${SiAutocompleteListboxDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-autocomplete-listbox-${SiAutocompleteListboxDirective.idCounter++}`);

  readonly autocomplete = input.required<SiAutocompleteDirective<T>>({
    alias: 'siAutocompleteListboxFor'
  });

  readonly siAutocompleteOptionSubmitted = output<T | undefined>();

  constructor() {
    afterRenderEffect(() => {
      if (this.autocomplete()?.expanded() === true) {
        this.listbox.scrollActiveItemIntoView();
      }
    });
  }

  listboxClick(): void {
    this.autocomplete().expanded.set(false);
    this.autocomplete().value.set(this.listbox.value());
  }
}
