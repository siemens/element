/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, computed, input, model, OnChanges } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Link } from '@siemens/element-ng/link';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t,
  TranslatableString
} from '@siemens/element-translate-ng/translate';
import { map, of, switchMap } from 'rxjs';

import { SiWidgetBaseDirective } from '../si-widget-base.directive';
import { SiListWidgetItem, SiListWidgetItemComponent } from './si-list-widget-item.component';

/** Defines the sort order. */
export type SortOrder = 'ASC' | 'DSC';

/**
 * The `<si-list-widget-body>` implements the body of the <si-list-widget> that can be
 * used for composition within other components.
 */
@Component({
  selector: 'si-list-widget-body',
  imports: [SiListWidgetItemComponent, SiSearchBarComponent, SiTranslatePipe, FormsModule],
  templateUrl: './si-list-widget-body.component.html',
  styleUrl: './si-list-widget-body.component.scss',
  host: { class: '' }
})
export class SiListWidgetBodyComponent
  extends SiWidgetBaseDirective<SiListWidgetItem[]>
  implements OnChanges
{
  private readonly translateService = injectSiTranslateService();

  /** Optional footer link for the list widget */
  readonly link = input<Link>();

  /**
   * label for the "search placeholder" name
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LIST_WIDGET.SEARCH_PLACEHOLDER:Search…`)
   * ```
   */
  readonly searchPlaceholderLabel = input(
    t(() => $localize`:@@SI_LIST_WIDGET.SEARCH_PLACEHOLDER:Search…`)
  );

  /**
   * Enable ascending and descending SiListWidgetItem sorting. If enabled,
   * items are initially ascending sorted.
   */
  readonly sort = input<SortOrder>();

  /**
   * Enables the search functionality.
   *
   * @defaultValue false
   */
  readonly search = input(false, { transform: booleanAttribute });

  /**
   * Compare function of for two `SiListWidgetItem`s that is used to sort
   * the array of items. The default compares the item labels by using the
   * string `localeCompare()` function.
   *
   * @param a - first `SiListWidgetItem` of the comparison.
   *
   * @param b - second `SiListWidgetItem` of the comparison.
   *
   * @returns A value `< 0` if `a` is smaller, `> 0` if `b` is smaller, otherwise `0`.
   *
   * @defaultValue
   * ```
   * (
   *     a: SiListWidgetItem,
   *     b: SiListWidgetItem
   *   ) => {
   *     const aLabel = typeof a.label === 'object' ? a.label.title! : a.label;
   *     const bLabel = typeof b.label === 'object' ? b.label.title! : b.label;
   *     return aLabel.localeCompare(bLabel);
   *   }
   * ```
   */
  readonly compareFn = input<(a: SiListWidgetItem, b: SiListWidgetItem) => number | undefined>(
    (a: SiListWidgetItem, b: SiListWidgetItem) => {
      const aLabel = typeof a.label === 'object' ? a.label.title! : a.label;
      const bLabel = typeof b.label === 'object' ? b.label.title! : b.label;
      return aLabel.localeCompare(bLabel);
    }
  );

  /**
   * Filter function that is used to filter down the list items when the user enters
   * a term in the search bar. Default function.
   *
   * @param item - The item be checked if it matches the searchTerm.
   *
   * @param searchTerm - The string the user typed in the search bar.
   *
   * @returns `true` if the `searchTerm` matches the `item` and the `item` shall be kept in the list.
   *
   * @defaultValue
   * ```
   * (
   *     item: SiListWidgetItem,
   *     searchTerm: string
   *   ) => {
   *     const aLabel = typeof item.label === 'object' ? item.label.title! : item.label;
   *     return aLabel.toLowerCase().includes(searchTerm.toLowerCase());
   *   }
   * ```
   */
  readonly filterFn = input<(item: SiListWidgetItem, searchTerm: string) => boolean | undefined>(
    (item: SiListWidgetItem, searchTerm: string) => {
      const aLabel = typeof item.label === 'object' ? item.label.title! : item.label;
      return aLabel.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  /**
   * The number of skeleton progress indication rows.
   *
   * @defaultValue 6
   */
  readonly numberOfLinks = input(6);

  /** Used to display the defined number of ghost items */
  protected readonly ghosts = computed(() => new Array(this.numberOfLinks() ?? 6));

  /** Replica of value with pre-translated labels, recomputed when value or language changes. */
  private readonly translatedItems = toSignal(
    toObservable(this.value).pipe(
      switchMap(items => {
        if (!items) {
          return of(undefined);
        }
        const keys = items.map(item =>
          typeof item.label === 'object' ? (item.label.title ?? '') : item.label
        );
        return this.translateService.translateAsync(keys).pipe(
          map(translations =>
            items.map(item => {
              const key = typeof item.label === 'object' ? (item.label.title ?? '') : item.label;
              const translatedLabel = (translations[key] ?? key) as TranslatableString;
              return {
                ...item,
                label:
                  typeof item.label === 'object'
                    ? { ...item.label, title: translatedLabel }
                    : translatedLabel
              };
            })
          )
        );
      })
    )
  );

  /** Holds the list items that are displayed. May be filtered and sorted. */
  protected readonly filteredListWidgetItems = computed(() => {
    const value = this.translatedItems();
    const sort = this.sort();
    const searchText = this.searchText();
    let filteredListWidgetItems: SiListWidgetItem[] | undefined;
    if (searchText.length > 0) {
      filteredListWidgetItems = value?.filter((item: SiListWidgetItem) =>
        this.filterFn()(item, searchText)
      );
    } else {
      filteredListWidgetItems = value ? [...value] : undefined;
    }

    if (sort) {
      const factor = sort === 'ASC' ? 1 : -1;
      filteredListWidgetItems = filteredListWidgetItems?.sort(
        (a: SiListWidgetItem, b: SiListWidgetItem) => (this.compareFn()(a, b) ?? 0) * factor
      );
    }

    return filteredListWidgetItems;
  });

  protected readonly searchText = model('');
}
