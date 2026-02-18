/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { iconSetAlpine, Theme, themeAlpine } from 'ag-grid-community';

import {
  elementCheckboxStyle,
  elementColorScheme,
  elementIconOverrides,
  elementPaginationStyle,
  elementPinningStyle,
  elementRadioStyle,
  elementSkeletonStyle,
  elementTextFilterStyle,
  elementToggleStyle
} from './parts';

/**
 * Base theme combining all Element design system parts with AG Grid Alpine theme.
 * This theme includes custom styling for checkboxes, radios, toggles, pagination,
 * pinning, skeleton loaders, text filters, icons, and color scheme.
 * @internal
 */
const elementBaseTheme: Theme = themeAlpine
  .withPart(iconSetAlpine)
  .withPart(elementCheckboxStyle)
  .withPart(elementRadioStyle)
  .withPart(elementToggleStyle)
  .withPart(elementPaginationStyle)
  .withPart(elementPinningStyle)
  .withPart(elementSkeletonStyle)
  .withPart(elementTextFilterStyle)
  .withPart(elementIconOverrides)
  .withPart(elementColorScheme);

/**
 * Standard density Element AG Grid theme.
 * Provides balanced spacing suitable for most use cases.
 * - Row height: 42px
 * - Header height: 48px
 * - Spacing: 8px
 */
export const elementTheme: Theme = elementBaseTheme.withParams({
  rowHeight: '42px',
  headerHeight: '48px',
  spacing: '8px'
});

/**
 * Compact density Element AG Grid theme.
 * Optimized for displaying more data in limited space.
 * - Row height: 28px
 * - Header height: 32px
 * - Spacing: 4px
 */
export const elementThemeCompact: Theme = elementBaseTheme.withParams({
  rowHeight: '28px',
  headerHeight: '32px',
  spacing: '4px'
});

/**
 * Comfort density Element AG Grid theme.
 * Provides generous spacing for enhanced readability and touch interactions.
 * - Row height: 84px
 * - Header height: 96px
 * - Spacing: 12px
 */
export const elementThemeComfort: Theme = elementBaseTheme.withParams({
  rowHeight: '84px',
  headerHeight: '96px',
  spacing: '12px'
});
