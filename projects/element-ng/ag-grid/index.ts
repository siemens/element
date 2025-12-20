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
export * from './ag-date-input.component';

/**
 * The Element design system theme for AG Grid.
 * Extends the Alpine theme with Element design tokens, icons, and component styling.
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
export const elementTheme: Theme = themeAlpine
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
