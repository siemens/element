/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { iconOverrides, Theme, themeQuartz } from 'ag-grid-community';

import { elementMenu } from '../icon';
import { elementColorScheme } from './element-datatable-theme';

// sample icon override
const elementIconOverrides = iconOverrides({
  type: 'image',
  mask: true,
  // override IconSet with element icons
  icons: {
    'filter': {
      svg: elementMenu.split(',')[1]
    }
  }
});

export const elementGridTheme: Theme = themeQuartz
  .withPart(elementColorScheme)
  .withPart(elementIconOverrides);
