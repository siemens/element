/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  elementFilter,
  elementMenu,
  elementSortDown,
  elementSortUp
} from '@siemens/element-ng/icon';
import { iconOverrides, Theme, themeQuartz } from 'ag-grid-community';

import { elementColorScheme } from './element-datatable-theme';

// sample icon override
const elementIconOverrides = iconOverrides({
  type: 'image',
  mask: true,
  icons: {
    'menu': {
      svg: elementMenu.split(',')[1]
    },
    'filter': {
      svg: elementFilter.split(',')[1]
    },
    'asc': {
      svg: elementSortUp.split(',')[1]
    },
    'desc': {
      svg: elementSortDown.split(',')[1]
    },
    'grip': {
      svg: elementMenu.split(',')[1]
    }
  }
});

export const elementGridTheme: Theme = themeQuartz
  .withPart(elementColorScheme)
  .withPart(elementIconOverrides)
  .withParams({
    fontFamily: 'Siemens Sans, sans-serif'
  });
