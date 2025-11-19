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

const createIconMap = (icons: Record<string, string>): Record<string, { svg: string }> =>
  Object.fromEntries(
    Object.entries(icons).map(([key, dataUri]) => [key, { svg: dataUri.split(',')[1] }])
  );

export const elementIconOverrides = iconOverrides({
  type: 'image',
  mask: true,
  icons: createIconMap({
    // Grid actions
    menu: elementMenu,
    'menu-alt': elementOptionsVertical,
    grip: elementMenu,

    // Column operations
    filter: elementFilter,
    asc: elementSortUp,
    desc: elementSortDown,
    pin: elementPin,
    columns: elementColumnMove,

    // Clipboard operations
    cut: elementCut,
    copy: elementCopy,
    paste: elementPaste,

    // Export operations
    export: elementExport,
    csv: elementDocument,
    excel: elementDocument,

    // Navigation
    'small-down': elementDown1Filled,
    first: elementBeginFilled,
    last: elementEndFilled,
    previous: elementLeft2,
    next: elementRight2
  })
});
