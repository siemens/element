/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, Component, computed, input, model, OnChanges } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { AccentLineType } from '@siemens/element-ng/common';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import {
  addIcons,
  elementRight2,
  elementSortDown,
  elementSortUp,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWidgetBaseComponent } from '../si-widget-base.component';
import { SiListWidgetBodyComponent, SortOrder } from './si-list-widget-body.component';
import { SiListWidgetItem } from './si-list-widget-item.component';

/**
 * The `<si-list-widget>` supports an easy composition of links and actions
 * with support for skeleton loading indicator, wrapped in a card.
 */
@Component({
  selector: 'si-list-widget',
  imports: [
    NgClass,
    SiCardComponent,
    SiIconNextComponent,
    SiLinkDirective,
    SiListWidgetBodyComponent,
    SiTranslateModule
  ],
  templateUrl: './si-list-widget.component.html',
  host: { class: 'si-list-widget' }
})
export class SiListWidgetComponent
  extends SiWidgetBaseComponent<SiListWidgetItem[]>
  implements OnChanges
{
  protected readonly icons = addIcons({ elementRight2, elementSortDown, elementSortUp });

  /** List widget heading. */
  readonly heading = input<TranslatableString>();

  /** Optional footer link for the list widget */
  readonly link = input<Link>();

  /**
   * label for the "search placeholder" name
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LIST_WIDGET.SEARCH_PLACEHOLDER:Search...`)
   * ```
   */
  readonly searchPlaceholderLabel = input(
    t(() => $localize`:@@SI_LIST_WIDGET.SEARCH_PLACEHOLDER:Search...`)
  );

  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LIST_WIDGET.SORT_ASCENDING:Sort ascending`)
   * ```
   */
  readonly sortAscendingLabel = input(
    t(() => $localize`:@@SI_LIST_WIDGET.SORT_ASCENDING:Sort ascending`)
  );

  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LIST_WIDGET.SORT_DESCENDING:Sort descending`)
   * ```
   */
  readonly sortDescendingLabel = input(
    t(() => $localize`:@@SI_LIST_WIDGET.SORT_DESCENDING:Sort descending`)
  );

  /**
   * Set `ASC` of ascending sorting, `DSC` for descending sorting and `undefined` for no sorting.
   */
  readonly sort = model<SortOrder>();

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
  /**
   * Optional accent line
   */
  readonly accentLine = input<AccentLineType>();

  protected readonly accentClass = computed(() => {
    const accentLine = this.accentLine();
    return accentLine ? 'accent-' + accentLine : '';
  });

  /** The menu item array used to display the sort button. */
  protected readonly sortAction = computed(() => {
    const sortAction: ContentActionBarMainItem[] = [
      {
        label: this.sortDescendingLabel(),
        type: 'action',
        icon: this.icons.elementSortUp,
        iconOnly: true,
        action: () => this.doSort()
      }
    ];

    if (this.sort() === 'ASC') {
      sortAction[0].label = this.sortDescendingLabel();
      sortAction[0].icon = this.icons.elementSortUp;
    } else {
      sortAction[0].label = this.sortAscendingLabel();
      sortAction[0].icon = this.icons.elementSortDown;
    }
    return sortAction;
  });

  private doSort(): void {
    if (this.sort() === 'ASC') {
      this.sort.set('DSC');
    } else {
      this.sort.set('ASC');
    }
  }
}
