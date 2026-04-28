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
  readonly heading = input<TranslatableString>();
  readonly subHeading = input<TranslatableString>();
  readonly headingId = input<string>();
  readonly subHeadingId = input<string>();
  /** @defaultValue [] */
  readonly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);
  /** @defaultValue [] */
  readonly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);
  readonly actionParam = input<unknown>();
  /** @defaultValue 'collapsible' */
  readonly actionBarViewType = input<ViewType>('collapsible');
  /** @defaultValue '' */
  readonly actionBarTitle = input<TranslatableString>('');

  readonly displayContentActionBar = computed(
    () => this.primaryActions()?.length > 0 || this.secondaryActions()?.length > 0
  );
}
