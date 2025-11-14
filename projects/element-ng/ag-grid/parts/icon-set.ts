/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  elementColumnMove,
  elementCopy,
  elementCut,
  elementDocument,
  elementExport,
  elementFilter,
  elementMenu,
  elementPaste,
  elementPin,
  elementSortDown,
  elementSortUp
} from '@siemens/element-ng/icon';
import { iconOverrides } from 'ag-grid-community';

export const elementIconOverrides = iconOverrides({
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
    },
    'pin': {
      svg: elementPin.split(',')[1]
    },
    'columns': {
      svg: elementColumnMove.split(',')[1]
    },
    'cut': {
      svg: elementCut.split(',')[1]
    },
    'copy': {
      svg: elementCopy.split(',')[1]
    },
    'paste': {
      svg: elementPaste.split(',')[1]
    },
    'export': {
      svg: elementExport.split(',')[1]
    },
    'csv': {
      svg: elementDocument.split(',')[1]
    },
    'excel': {
      svg: elementDocument.split(',')[1]
    },
    'menu-alt': {
      svg: elementMenu.split(',')[1]
    }
  }
});
