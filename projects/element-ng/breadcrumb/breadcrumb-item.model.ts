/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Link } from '@siemens/element-ng/link';

/**
 * Item that should be displayed in a breadcrumb.
 * As input, we expect an optional title and link,
 * which can be an URL or array of URL segments.
 */
export interface BreadcrumbItem extends Link {
  title: string;
}

/**
 * Extends {@link EnumeratedBreadcrumbItem} and adds
 * the level, if it is shortened, a shortened title and
 * if it is the last item
 */
export interface EnumeratedBreadcrumbItem extends BreadcrumbItem {
  /**
   * The current level relative to the root, the root is 0
   */
  level: number;
  /**
   * Whether the title is displayed in full length or it is shortened.
   */
  shortened?: boolean;
  /**
   * The shortened title, if the title is not shortened, it is the same as the title.
   */
  shortenedTitle?: string;
  /**
   * Whether it is the last breadcrumb item and should be styled differently.
   */
  lastItem?: boolean;
}
