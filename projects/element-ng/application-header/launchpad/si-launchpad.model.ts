/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { IsActiveMatchOptions, NavigationExtras } from '@angular/router';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** Represents an app to be shown in the launchpad. */
export interface AppLink extends AppBase {
  /** The type of the app. can be either 'link' or 'router-link' */
  type?: 'link';
  /** URL destination of the app. */
  href: string;
  /** Value for the anchor target attribute. */
  target?: string;
  /** Whether the app is the currently running app. */
  active?: boolean;
}

export interface AppRouterLink extends AppBase {
  type: 'router-link';
  /** Link for the angular router. Accepts the same values as {@link https://angular.dev/api/router/RouterLink}. */
  routerLink: string | any[];
  /** Navigation extras that are passed to the {@link https://angular.dev/api/router/NavigationExtras}. */
  extras?: NavigationExtras;
  /** Active match options for routerLinkActive {@link https://angular.dev/api/router/IsActiveMatchOptions}.*/
  activeMatchOptions?: { exact: boolean } | IsActiveMatchOptions;
}

/** Represents a categories in the launchpad. */
export interface AppCategory {
  /** The name of the app category. */
  name?: TranslatableString;
  /** The apps to show under this category.  */
  apps: App[];
}

export interface AppBase {
  /** Name of the app */
  name: TranslatableString;
  /** Name of the related system. */
  systemName?: TranslatableString;
  /** Icon of the app. */
  iconUrl?: string;
  /** CSS class to apply, which should render the icon. Typically, "element-*". */
  iconClass?: string;
  /** Whether the app is marked as favorite.  */
  favorite?: boolean;
  /** Whether the app should be marked as external. */
  external?: boolean;
}

export type App = AppLink | AppRouterLink;
