/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { createPart, createTheme, iconOverrides, Theme } from 'ag-grid-community';


const elementVariables = createPart({
  feature: 'colorScheme',
  params: {},
  modeParams: {
    // for data-ag-theme-mode="mode"
    light: {},
    dark: {}
  }
});

const elementIconOverrides = iconOverrides({
  type: 'image',
  // override IconSet with element icons
  icons: {
    '': {
      svg: ''
    }
  }
});

export const elementGridTheme: Theme = createTheme()
  .withPart(elementVariables)
  .withPart(elementIconOverrides);
