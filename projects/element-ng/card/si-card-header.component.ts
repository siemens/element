/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent,
  ViewType
} from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Shared card header used internally by `SiCardComponent`, `SiActionCardComponent`,
 * and `SiDashboardCardComponent`. Not intended for direct use by consuming applications.
 *
 * @internal
 */
@Component({
  selector: 'si-card-header',
  imports: [SiContentActionBarComponent, SiTranslatePipe],
  templateUrl: './si-card-header.component.html',
  styleUrl: './si-card-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card-header d-flex justify-content-between'
  }
})
export class SiCardHeaderComponent {
  /** The primary title text displayed in the card header. */
  readonly heading = input<TranslatableString>();
  /** The secondary title text displayed below the main heading. */
  readonly subHeading = input<TranslatableString>();
  /** HTML `id` applied to the heading element, used to associate `aria-labelledby` attributes. */
  readonly headingId = input<string>();
  /** HTML `id` applied to the sub-heading element, used to associate `aria-labelledby` attributes. */
  readonly subHeadingId = input<string>();
  /**
   * Primary action items rendered as buttons in the content action bar.
   * @defaultValue []
   */
  readonly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);
  /**
   * Secondary action items rendered in the content action bar overflow menu.
   * @defaultValue []
   */
  readonly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);
  /** Optional parameter passed to action item callbacks when an action is triggered. */
  readonly actionParam = input<unknown>();
  /**
   * Controls how the content action bar renders its actions.
   * @defaultValue 'collapsible'
   */
  readonly actionBarViewType = input<ViewType>('collapsible');
  /**
   * Accessible title for the content action bar, used as an `aria-label`.
   * @defaultValue ''
   */
  readonly actionBarTitle = input<TranslatableString>('');

  readonly displayContentActionBar = computed(
    () => this.primaryActions()?.length > 0 || this.secondaryActions()?.length > 0
  );
}
