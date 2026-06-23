/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox } from '@angular/aria/combobox';
import { afterRenderEffect, Directive, inject, model, signal } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';

@Directive({
  selector: 'input[siAutocomplete]',
  /*host: {
    role: 'combobox',
    'aria-autocomplete': 'list',
    '[attr.aria-activedescendant]': 'activeDescendant',
    '[attr.aria-controls]': 'listbox()?.id()',
    '[attr.aria-expanded]': '!!listbox()'
  },*/
  hostDirectives: [{
    directive: Combobox,
    inputs: ['disabled', 'softDisabled', 'alwaysExpanded', 'tabindex', 'expanded', 'value', 'inlineSuggestion']
  }],
  exportAs: 'siAutocomplete'
})
export class SiAutocompleteDirective<T> {
  /** @defaultValue '' */
  readonly value = model();
  /** @defaultValue false */
  readonly expanded = model(false);
  /** @internal */
  readonly listbox = signal<SiAutocompleteListboxDirective<T> | undefined>(undefined);
  readonly combobox = inject(Combobox);


  constructor() {
    afterRenderEffect(() => {
      if (this.combobox?.expanded() === true) {
        this.listbox()?.listbox.scrollActiveItemIntoView();
      }
    });
  }

  /*@HostListener('keydown', ['$event'])
  protected keydown(event: KeyboardEvent): void {
    this.listbox()?.onKeydown(event);
  }*/

  
}
