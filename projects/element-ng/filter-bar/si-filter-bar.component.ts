/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input, model, output, viewChild } from '@angular/core';
import {
  SiAutoCollapsableListAdditionalContentDirective,
  SiAutoCollapsableListDirective,
  SiAutoCollapsableListItemDirective,
  SiAutoCollapsableListOverflowItemDirective
} from '@siemens/element-ng/auto-collapsable-list';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { Filter } from './filter';
import { SiFilterPillComponent } from './si-filter-pill.component';

@Component({
  selector: 'si-filter-bar',
  imports: [
    SiAutoCollapsableListDirective,
    SiAutoCollapsableListItemDirective,
    SiAutoCollapsableListOverflowItemDirective,
    SiAutoCollapsableListAdditionalContentDirective,
    SiFilterPillComponent,
    SiTranslateModule
  ],
  templateUrl: './si-filter-bar.component.html',
  styleUrl: './si-filter-bar.component.scss',
  host: {
    '[class.reset]': 'allowReset()'
  }
})
export class SiFilterBarComponent {
  /**
   * Custom text if no filters are selected.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTER_BAR.NO_FILTERS:No filters applied`
   * ```
   */
  readonly filterDefaultText = input($localize`:@@SI_FILTER_BAR.NO_FILTERS:No filters applied`);
  /**
   * Array of filter items to show
   *
   * @defaultValue []
   */
  readonly filters = model<Filter[]>([]);
  /**
   * Text for reset button
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTER_BAR.RESET_FILTERS:Reset filters`
   * ```
   */
  readonly resetText = input($localize`:@@SI_FILTER_BAR.RESET_FILTERS:Reset filters`);
  /**
   * Set false to hide reset filters button
   *
   * @defaultValue true
   */
  readonly allowReset = input(true, { transform: booleanAttribute });
  /**
   * Color to use for component background
   *
   * @defaultValue 'base-1'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-1');

  /**
   * Set to true to disable component
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Custom text for the collapsed filters.
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTER_BAR.COLLAPSED_FILTERS_DESCRIPTION:+ {{count}} filters`
   * ```
   */
  readonly collapsedFiltersDescription = input(
    $localize`:@@SI_FILTER_BAR.COLLAPSED_FILTERS_DESCRIPTION:+ {{count}} filters`
  );

  /**
   * Output callback to be executed when the reset filter is clicked
   */
  readonly resetFilters = output<void>();

  private readonly collapsableListDirective = viewChild.required(SiAutoCollapsableListDirective);

  protected deleteFilters(deletedPill: Filter): void {
    this.filters.set(this.filters().filter(filter => filter !== deletedPill));
  }

  protected onResetFilters(): void {
    this.filters.set([]);
    this.resetFilters.emit();
  }

  protected deleteOverflowFilter(): void {
    this.filters.update(filters =>
      filters.slice(
        0,
        this.collapsableListDirective()
          .items.toArray()
          .findIndex(item => !item.isVisible())
      )
    );
  }
}
