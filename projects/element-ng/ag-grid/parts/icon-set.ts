/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  elementBeginFilled,
  elementColumnMove,
  elementCopy,
  elementCut,
  elementDocument,
  elementDown1Filled,
  elementEndFilled,
  elementExport,
  elementFilter,
  elementLeft2,
  elementMenu,
  elementOptionsVertical,
  elementPaste,
  elementPin,
  elementRight2,
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
      svg: elementOptionsVertical.split(',')[1]
    },
    'small-down': {
      svg: elementDown1Filled.split(',')[1]
    },
    'first': {
      svg: elementBeginFilled.split(',')[1]
    },
    'last': {
      svg: elementEndFilled.split(',')[1]
    },
    'previous': {
      svg: elementLeft2.split(',')[1]
    },
    'next': {
      svg: elementRight2.split(',')[1]
    }
  }
});
