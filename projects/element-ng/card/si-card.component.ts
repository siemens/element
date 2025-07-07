/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input } from '@angular/core';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent,
  ViewType
} from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiCardBaseDirective } from './si-card-base.directive';

@Component({
  selector: 'si-card',
  imports: [SiContentActionBarComponent, SiTranslatePipe],
  templateUrl: './si-card.component.html',
  styleUrl: './si-card.component.scss'
})
export class SiCardComponent extends SiCardBaseDirective {
  /**
   * Input list of primary action items. Supports up to **4** actions and omits additional ones.
   *
   * @defaultValue []
   */
  readonly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);
  /**
   * Input list of secondary action items.
   *
   * @defaultValue []
   */
  readonly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);
  /**
   * A param that will be passed to the `action` in the primary/secondary actions.
   * This allows to re-use the same primary/secondary action arrays across rows
   * in a table.
   */
  readonly actionParam = input<any>();
  /**
   * The view type of the content action bar of the card. Default is `collapsible`
   * for dashboards. However, in some cases you might need to change to `expanded`
   * or `mobile`.
   *
   * @defaultValue 'collapsible'
   */
  readonly actionBarViewType = input<ViewType>('collapsible');
  /**
   * Optional setting of html title attribute for the content action bar.
   * Helpful for a11y when only one action is configured in expand mode.
   *
   * @defaultValue ''
   */
  readonly actionBarTitle = input<TranslatableString>('');
  /**
   * Returns `true` when primary or secondary actions are set.
   */
  readonly displayContentActionBar = computed(
    () => this.primaryActions()?.length > 0 || this.secondaryActions()?.length > 0
  );
}
