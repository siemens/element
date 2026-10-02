/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, InjectionToken } from '@angular/core';

import { SiSearchBarComponent } from './si-search-bar.component';

/** @internal */
export const SI_SEARCH_BAR = new InjectionToken<SiSearchBarComponent>('si-search-bar');

/**
 * Input used by {@link SiSearchBarComponent} instead of its default input.
 */
@Directive({
  selector: 'input[siSearchBarInput]',
  host: {
    type: 'text',
    class: 'search-bar-input form-control',
    '[disabled]': 'searchBar.disabled()',
    '[placeholder]': 'searchBar.placeholder()',
    '[class.icon-end]': 'searchBar.searchValue()',
    '[attr.maxlength]': 'searchBar.maxlength()',
    '[readonly]': 'searchBar.readonly()',
    '[value]': 'searchBar.searchValue()',
    '(blur)': 'searchBar.onBlur()',
    '(input)': 'searchBar.input($event)'
  }
})
export class SiSearchBarInputDirective {
  protected readonly searchBar = inject(SI_SEARCH_BAR);
}
