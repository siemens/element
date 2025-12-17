/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { iconSetAlpine, Theme, themeAlpine } from 'ag-grid-community';

import { checkboxStyle, elementColorScheme, elementIconOverrides, radioStyle } from './parts';

export const elementTheme: Theme = themeAlpine
  .withPart(iconSetAlpine)
  .withPart(checkboxStyle)
  .withPart(radioStyle)
  .withPart(elementIconOverrides)
  .withPart(elementColorScheme);
