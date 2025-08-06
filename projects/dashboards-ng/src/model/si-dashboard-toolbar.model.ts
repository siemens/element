/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { NavigationExtras } from '@angular/router';
import { TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

import { SiGridComponent } from '../components/grid/si-grid.component';

/** Interface representing an action item in the dashboard toolbar. */
export interface DashboardToolbarItemAction {
  type: 'action';
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** Action that called when the item is triggered. */
  action: (grid: SiGridComponent) => void;
}

/** Interface representing a router link item in the dashboard toolbar. */
export interface DashboardToolbarItemRouterLink {
  type: 'router-link';
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** Link for the angular router. Accepts the same values as {@link RouterLink}. */
  routerLink: string | any[];
  /** Navigation extras that are passed to the {@link RouterLink}. */
  extras?: NavigationExtras;
}

/** Interface representing a link item in the dashboard toolbar. */
export interface DashboardToolbarItemLink {
  type: 'link';
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** The href property of the anchor. */
  href: string;
  /** The target property of the anchor. */
  target?: string;
}

/** Union type for all possible items in the dashboard toolbar. */
export type DashboardToolbarItem =
  | DashboardToolbarItemAction
  | DashboardToolbarItemRouterLink
  | DashboardToolbarItemLink;
