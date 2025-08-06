/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { IsActiveMatchOptions, NavigationExtras } from '@angular/router';
import { TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

/** Common properties shared among navbar item types. */
export interface NavbarVerticalItemBase {
  /** The ID is required if the navbar is used with UIState. */
  id?: string;
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** Optional icon that will be rendered before the label. */
  icon?: string;
  /** Badge that is rendered after the label or as a red dot in the collapsed state. */
  badge?: string | number;
  /** Color of the badge.
   * Use any color shown here {@link https://element.siemens.io/components/status-notifications/badges/#example}
   * without `bg-` prefix.
   */
  badgeColor?: string;
}

/** Use this type to create a group that can hold multiple items. */
export interface NavbarVerticalItemGroup extends NavbarVerticalItemBase {
  type: 'group';
  /** Submenu items for this menu item. */
  children: NavbarVerticalSubItem[];
  /** Set this property if the item should be expanded by default. */
  expanded?: boolean;
}

/** Use this type to create a routerLink item. */
export interface NavbarVerticalItemRouterLink extends NavbarVerticalItemBase {
  type: 'router-link';
  /** Link for the angular router. Accepts the same values as {@link RouterLink}. */
  routerLink: string | any[];
  /** Navigation extras that are passed to the {@link RouterLink}. */
  extras?: NavigationExtras;
  /** Active match options for routerLinkActive */
  activeMatchOptions?: { exact: boolean } | IsActiveMatchOptions;
}

/** Use this type to create an href link that will cause a real navigation. */
export interface NavbarVerticalItemLink extends NavbarVerticalItemBase {
  type: 'link';
  /** The href property of the anchor. */
  href: string;
  /** The target property of the anchor. */
  target?: string;
}

/**
 * AVOID USING THIS TYPE!
 * Actions inside the navbar are an indication for a code smell.
 *
 * Use {@link NavbarVerticalItemRouterLink} instead whenever possible.
 */
export interface NavbarVerticalItemAction extends NavbarVerticalItemBase {
  type: 'action';
  /** Action that is called when the navbar item is triggered. */
  action: (source: this) => void;
  /**
   * The active state of the item.
   * Note: It must be set manually.
   */
  active?: boolean;
}

export interface NavbarVerticalItemHeader {
  type: 'header';
  label: TranslatableString;
}

export interface NavbarVerticalItemDivider {
  type: 'divider';
}

/** Union type for all possible all items in the navbar. */
export type NavbarVerticalItem =
  | NavbarVerticalItemGroup
  | NavbarVerticalItemRouterLink
  | NavbarVerticalItemLink
  | NavbarVerticalItemAction
  | NavbarVerticalItemHeader
  | NavbarVerticalItemDivider;

/** Union type for all items that can be wrapped in a group. */
export type NavbarVerticalSubItem =
  | NavbarVerticalItemRouterLink
  | NavbarVerticalItemLink
  | NavbarVerticalItemAction;
