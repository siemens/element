/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, HostListener, signal } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';
import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';

@Directive({
  selector: 'input[siAutocomplete]',
  host: {
    role: 'combobox',
    'aria-autocomplete': 'list',
    '[attr.aria-activedescendant]': 'activeDescendant',
    '[attr.aria-controls]': 'listbox()?.id()',
    '[attr.aria-expanded]': '!!listbox()'
  },
  exportAs: 'siAutocomplete'
})
export class SiAutocompleteDirective<T> {
  /** @internal */
  readonly listbox = signal<SiAutocompleteListboxDirective<T> | undefined>(undefined);

  protected get activeDescendant(): string {
    return this.listbox()?.active?.id() ?? '';
  }

  @HostListener('keydown', ['$event'])
  protected keydown(event: KeyboardEvent): void {
    this.listbox()?.onKeydown(event);
  }

  get active(): SiAutocompleteOptionDirective<T> | undefined | null {
    return this.listbox()?.active;
  }
}
