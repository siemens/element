/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { debounce, form, FormField, pattern } from '@angular/forms/signals';
import { elementSearch } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSearchBarComponent, SiSearchBarInputDirective } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

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
  protected readonly searchField = form(this.searchTerm, path => {
    debounce(path, (_context, abortSignal) => {
      const delay = this.debounceTime();
      if (delay > 0) {
        return new Promise<void>(resolve => {
          const timeout = setTimeout(resolve, delay);
          abortSignal.addEventListener('abort', () => clearTimeout(timeout), { once: true });
        });
      }
      return;
    });
    pattern(path, /^[^*?]*$/);
  });

  private readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      const searchTerm = this.searchTerm();
      if (this.searchField().valid()) {
        untracked(() => this.searchChange.emit(searchTerm));
      }
    });
  }

  protected expandForSearch(): void {
    this.navbar.expand();
    setTimeout(() => this.searchInput().nativeElement.focus());
  }
}
