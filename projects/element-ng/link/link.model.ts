/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NavigationExtras } from '@angular/router';
import { TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

export interface Link {
  /**
   * The title of the menu item. Can be either the title to be displayed or the translation key.
   */
  title?: TranslatableString;
  /**
   * The optional tooltip of the link. Can be either the text to be displayed or the
   * translation key.
   */
  tooltip?: TranslatableString;
  /**
   * Defines a href URI that the menu item will be linked to. Will be used to set the href attribute
   * of the a element. Will only be used if link and function is not set.
   */
  href?: string;
  /**
   * The target attribute specifies where to open the linked document. If no target is specified,
   * the link will open in the current tab.
   */
  target?: string;
  /**
   * Defines the link of the menu item within the application using the angular router link concept.
   * Accepts an array of `any` as per [routerLink API definition]{@link https://angular.dev/api/router/RouterLink}.
   */
  link?: any[] | string;
  /**
   * The navigation extras provide additional routing options when using the router link.
   */
  navigationExtras?: NavigationExtras;
  /**
   * A function that will be invoked when clicking on the menu item.
   * When passed as a string, use together with SiLinkActionService to receive events. This is
   * meant for repetitive things in lists/tables/etc.
   */
  action?: ((param?: any) => void | any) | string;
  /**
   * A boolean that lets the link know whether it is active or not. It is useful when action() is executed instead of link route.
   */
  isActive?: boolean;
  /**
   * A boolean that lets the link know whether it is disabled or not.
   */
  disabled?: boolean;
}

/**
 * Used in events emitted from SiLinkActionService
 */
export interface LinkAction {
  link: Link;
  param: any;
}
