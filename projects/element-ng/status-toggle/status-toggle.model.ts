/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';

/** An item for si-status-toggle. */
export interface StatusToggleItem {
  /** Text displayed for the item. */
  text: TranslatableString;
  /** Icon displayed for the item. */
  icon: string;
  /** Value of the item. */
  value: string | number;
  /** Whether the item is disabled. */
  disabled?: boolean;
  /** Icon shown when the item is active. */
  activeIcon?: string;
  /** Stacked icon shown when the item is active. */
  activeIconStacked?: string;
  /** Class applied to the icon when the item is selected. */
  activeIconClass?: string;
  /** Class applied to the stacked icon when the item is selected. */
  activeIconStackedClass?: string;
  /** Class applied to the text when the item is selected. */
  activeTextClass?: string;
}
