/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Part, createPart } from 'ag-grid-community';

const makeColorSchemeTreeShakeable = (): Part =>
  createPart({
    params: {
      backgroundColor: 'var(--element-base-1)',
      headerBackgroundColor: 'transparent',
      textColor: 'var(--element-text-primary)',
      rowHoverColor: 'var(--element-base-1-hover)',
      selectedRowBackgroundColor: 'var(--element-base-1-selected)',
      headerHeight: '40px'
    }
  });

export const elementColorScheme = /*#__PURE__*/ makeColorSchemeTreeShakeable();
