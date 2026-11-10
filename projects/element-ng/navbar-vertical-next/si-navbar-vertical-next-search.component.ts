/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { form, FormField, pattern } from '@angular/forms/signals';
import { elementSearch } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { debounce, filter, of, timer } from 'rxjs';

import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-search',
  imports: [
    SiIconComponent,
    SiSearchBarComponent,
    SiSearchBarInputDirective,
    FormField,
    SiTranslatePipe
  ],
  templateUrl: './si-navbar-vertical-next-search.component.html',
  styleUrl: './si-navbar-vertical-next-search.component.scss'
})
export class SiNavbarVerticalNextSearchComponent {
  protected readonly icons = addIcons({ elementSearch });

  /**
   * Placeholder text for the search bar
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.SEARCH_PLACEHOLDER:Search…`)
   * ```
   */
  readonly placeholder = input(
    t(() => $localize`:@@SI_NAVBAR_VERTICAL.SEARCH_PLACEHOLDER:Search…`)
  );

  /**
   * Debounce time for the search input
   * @defaultValue 400
   */
  readonly debounceTime = input(400);

  /**
   * Output for search bar input
   */
  readonly searchChange = output<string>();

  protected readonly searchTerm = signal('');
  protected readonly searchField = form(this.searchTerm, path => pattern(path, /^[^*?]*$/));

  private readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    toObservable(this.searchTerm)
      .pipe(
        filter(() => this.searchField().dirty() && this.searchField().valid()),
        debounce(() => {
          const delay = this.debounceTime();
          return delay > 0 ? timer(delay) : of(0);
        }),
        takeUntilDestroyed()
      )
      .subscribe(searchTerm => this.searchChange.emit(searchTerm));
  }

  protected expandForSearch(): void {
    this.navbar.expand();
    setTimeout(() => this.searchInput().nativeElement.focus());
  }
}
