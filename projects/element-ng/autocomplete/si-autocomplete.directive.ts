/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, HostBinding, HostListener } from '@angular/core';

import { SiAutocompleteListboxDirective } from './si-autocomplete-listbox.directive';
import { SiAutocompleteOptionDirective } from './si-autocomplete-option.directive';

@Directive({
  selector: 'input[siAutocomplete]',
  host: {
    role: 'combobox',
    'aria-autocomplete': 'list'
  },
  exportAs: 'siAutocomplete'
})
export class SiAutocompleteDirective<T> {
  /** @internal */
  listbox?: SiAutocompleteListboxDirective<T>;

  @HostBinding('attr.aria-activedescendant')
  protected get activeDescendant(): string {
    return this.listbox?.active?.id() ?? '';
  }

  @HostBinding('attr.aria-controls')
  protected get ariaControls(): string | undefined {
    return this.listbox?.id();
  }

  @HostBinding('attr.aria-expanded')
  protected get expanded(): boolean {
    return !!this.listbox;
  }

  @HostListener('keydown', ['$event'])
  protected keydown(event: KeyboardEvent): void {
    this.listbox?.onKeydown(event);
  }

  get active(): SiAutocompleteOptionDirective<T> | undefined | null {
    return this.listbox?.active;
  }
}
