/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import type { NavigationExtras, RouterLink } from '@angular/router';
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

export interface MenuItemBase {
  /** ID that will be attached to the DOM node. */
  id?: string;
  /** Label that is shown to the user. */
  label: TranslatableString;
  /** Optional icon that will be rendered before the label. */
  icon?: string;
  /**
   * Badge (always red) that is attached to the icon.
   * If value===true, an empty red dot will be rendered.
   */
  iconBadge?: boolean | number | string;
  /** Badge that is rendered after the label. */
  badge?: string | number;
  /** Color of the badge (not iconBadge). */
  badgeColor?: string;
  /** Whether the menu item id disabled. */
  disabled?: boolean;
}

export interface MenuItemGroup extends MenuItemBase {
  type: 'group';
  /** Submenu items for this menu item. */
  children: MenuItem[];
}

export interface MenuItemAction extends MenuItemBase {
  type: 'action';
  /**
   * Action that called when the item is triggered.
   * A function will be called, a string will be dispatched to the {@link SiMenuActionService}.
   */
  action: ((actionParam: any, source: this) => void) | string;
}

/**
 * Represents a menu item that navigates using the Angular Router.
 *
 * Requires a configured Angular Router.
 */
export interface MenuItemRouterLink extends MenuItemBase {
  type: 'router-link';
  /** Link for the angular router. Accepts the same values as {@link RouterLink}. */
  routerLink: string | any[];
  /** Navigation extras that are passed to the {@link RouterLink}. */
  extras?: NavigationExtras;
}

export interface MenuItemLink extends MenuItemBase {
  type: 'link';
  /** The href property of the anchor. */
  href: string;
  /** The target property of the anchor. */
  target?: string;
}

export interface MenuItemRadioGroup {
  type: 'radio-group';
  /** Items that are part of the radio group. */
  children: [MenuItemHeader, ...(MenuItemRadio | MenuDivider | MenuItemHeader)[]];
}

export interface MenuItemRadio extends MenuItemBase {
  type: 'radio';
  /** Whether the radio is checked. */
  checked: boolean;
  /**
   * Action that called when the item is triggered.
   * A function will be called, a string will be dispatched to the {@link SiMenuActionService}.
   */
  action: ((actionParam: any, source: this) => void) | string;
}

export interface MenuItemCheckbox extends MenuItemBase {
  type: 'checkbox';
  /** Whether the checkbox is checked. */
  checked: boolean;
  /**
   * Action that called when the item is triggered.
   * A function will be called, a string will be dispatched to the {@link SiMenuActionService}.
   */
  action: ((actionParam: any, source: this) => void) | string;
}

export interface MenuItemHeader {
  type: 'header';
  /** The label of the header. */
  label: string;
}

export interface MenuDivider {
  type: 'divider';
}

export type MenuItem =
  | MenuItemGroup
  | MenuItemAction
  | MenuItemRouterLink
  | MenuItemLink
  | MenuItemRadioGroup
  | MenuItemCheckbox
  | MenuItemRadio
  | MenuItemHeader
  | MenuDivider;
