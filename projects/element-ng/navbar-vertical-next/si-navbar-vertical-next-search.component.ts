/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { elementSearch } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-search',
  imports: [SiIconComponent, SiSearchBarComponent, SiTranslatePipe],
  templateUrl: './si-navbar-vertical-next-search.component.html',
  styleUrl: './si-navbar-vertical-next-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  private readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  private readonly searchBar = viewChild.required(SiSearchBarComponent);

  protected expandForSearch(): void {
    this.navbar.expand();
    setTimeout(() => this.searchBar().focus());
  }
}
