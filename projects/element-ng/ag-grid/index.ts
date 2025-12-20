/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { iconSetAlpine, Theme, themeAlpine } from 'ag-grid-community';

import {
  checkboxStyle,
  elementColorScheme,
  elementIconOverrides,
  paginationStyle,
  pinningStyle,
  radioStyle,
  skeletonStyle,
  textFilterStyle,
  toggleStyle
} from './parts';

/**
 * Exports the custom AG Grid date input component.
 */
export * from './components/ag-date-input.component';

/**
 * Base Element AG Grid theme without density parameters.
 * This theme extends the Alpine theme with Element design tokens, icons, and component styling.
 * Use the density-specific theme exports (elementTheme, elementThemeCompact, elementThemeComfort)
 * or extend this base theme with custom density parameters using `.withParams()`.
 *
 * @internal
 */
const elementBaseTheme: Theme = themeAlpine
  .withPart(iconSetAlpine)
  .withPart(checkboxStyle)
  .withPart(radioStyle)
  .withPart(toggleStyle)
  .withPart(paginationStyle)
  .withPart(pinningStyle)
  .withPart(skeletonStyle)
  .withPart(textFilterStyle)
  .withPart(elementIconOverrides)
  .withPart(elementColorScheme);

/**
 * Standard density Element AG Grid theme (default).
 *
 * This is the recommended default density providing a balanced layout suitable for most use cases.
 *
 * **Density parameters:**
 * - Row height: 42px
 * - Header height: 48px
 * - Spacing: 8px
 *
 * @example
 * ```typescript
 * import { elementTheme } from '@siemens/element-ng/ag-grid';
 *
 * const gridOptions: GridOptions = {
 *   theme: elementTheme,
 *   // ... other options
 * };
 * ```
 */
export const elementTheme: Theme = elementBaseTheme.withParams({
  rowHeight: '42px',
  headerHeight: '48px',
  spacing: '8px'
});

/**
 * Compact density Element AG Grid theme.
 *
 * Use this theme when you need to display more data in a limited vertical space.
 * Suitable for data-dense applications or when working with large datasets.
 *
 * **Density parameters:**
 * - Row height: 28px
 * - Header height: 32px
 * - Spacing: 4px
 *
 * @example
 * ```typescript
 * import { elementThemeCompact } from '@siemens/element-ng/ag-grid';
 *
 * const gridOptions: GridOptions = {
 *   theme: elementThemeCompact,
 *   // ... other options
 * };
 * ```
 */
export const elementThemeCompact: Theme = elementBaseTheme.withParams({
  rowHeight: '28px',
  headerHeight: '32px',
  spacing: '4px'
});

/**
 * Comfortable density Element AG Grid theme.
 *
 * Use this theme when you want to provide more breathing room and improved readability.
 * Suitable for applications where accessibility and ease of scanning are priorities,
 * or when displaying less data per screen.
 *
 * **Density parameters:**
 * - Row height: 84px
 * - Header height: 96px
 * - Spacing: 12px
 *
 * @example
 * ```typescript
 * import { elementThemeComfort } from '@siemens/element-ng/ag-grid';
 *
 * const gridOptions: GridOptions = {
 *   theme: elementThemeComfort,
 *   // ... other options
 * };
 * ```
 */
export const elementThemeComfort: Theme = elementBaseTheme.withParams({
  rowHeight: '84px',
  headerHeight: '96px',
  spacing: '12px'
});

/**
 * Map of density theme names to their corresponding Element AG Grid themes.
 *
 * This convenience map allows dynamic theme selection based on a density string key.
 * Useful when implementing density toggles or user preferences in your application.
 *
 * **Available densities:**
 * - `'standard'` - Default balanced density (42px rows)
 * - `'compact'` - Reduced spacing for data-dense layouts (28px rows)
 * - `'comfort'` - Increased spacing for improved readability (84px rows)
 */
export const themeByDensity = new Map<string, Theme>([
  ['compact', elementThemeCompact],
  ['comfort', elementThemeComfort],
  ['standard', elementTheme]
]);
