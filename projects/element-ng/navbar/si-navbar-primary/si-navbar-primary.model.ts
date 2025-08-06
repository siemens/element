/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { MenuItem } from '@spike-rabbit/element-ng/common';
import { TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

/**
 * The AppItem is used to show apps in the launchpad.
 * @deprecated Use the new `si-application-header` instead.
 */
export interface AppItem extends MenuItem {
  /**
   * If `true`, the app is marked as a favorite.
   */
  isFavorite?: boolean;
  /**
   * If `true`, the app is marked as an external application opening in a new browser tab.
   */
  isExternal?: boolean;
}

/**
 * The AppItemCategory is used to show app categories in the launchpad.
 * @deprecated Use the new `si-application-header` instead.
 */
export interface AppItemCategory {
  /**
   * The name of the app category. Can be a translation key.
   */
  category?: TranslatableString;
  /**
   * The apps to show under this category.
   */
  items: AppItem[];
}
