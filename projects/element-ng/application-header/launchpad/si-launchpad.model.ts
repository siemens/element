/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** Represents an app to be shown in the launchpad. */
export interface App {
  /** Name of the app */
  name: TranslatableString;
  /** Name of the related system. */
  systemName?: TranslatableString;
  /** URL destination of the app. */
  href: string;
  /** Value for the anchor target attribute. */
  target?: string;
  /** Icon of the app. */
  iconUrl?: string;
  /** CSS class to apply, which should render the icon. Typically, "element-*". */
  iconClass?: string;
  /** Whether the app is marked as favorite.  */
  favorite?: boolean;
  /** Whether the app should be marked as external. */
  external?: boolean;
  /** Whether the app is the currently running app. */
  active?: boolean;
}

/** Represents a categories in the launchpad. */
export interface AppCategory {
  /** The name of the app category. */
  name?: TranslatableString;
  /** The apps to show under this category.  */
  apps: App[];
}
