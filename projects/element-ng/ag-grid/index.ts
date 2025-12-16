/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createTheme, iconSetAlpine, Theme } from 'ag-grid-community';

import { checkboxStyle, elementColorScheme, elementIconOverrides } from './parts';

export const elementTheme: Theme = createTheme()
  .withPart(iconSetAlpine)
  .withPart(elementIconOverrides)
  .withPart(checkboxStyle)
  .withPart(elementColorScheme);
