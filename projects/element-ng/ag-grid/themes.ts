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

export const elementTheme: Theme = elementBaseTheme.withParams({
  rowHeight: '42px',
  headerHeight: '48px',
  spacing: '8px'
});

export const elementThemeCompact: Theme = elementBaseTheme.withParams({
  rowHeight: '28px',
  headerHeight: '32px',
  spacing: '4px'
});

export const elementThemeComfort: Theme = elementBaseTheme.withParams({
  rowHeight: '84px',
  headerHeight: '96px',
  spacing: '12px'
});
