/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createTheme } from 'ag-grid-community';

import { elementIconOverrides } from './parts/icon-set';

export const elementTheme = createTheme().withPart(elementIconOverrides).withParams({
  fontFamily: '"SiemensSans Pro", sans-serif',
  iconSize: 18
});
