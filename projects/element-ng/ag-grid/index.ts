/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createTheme, iconSetAlpine, Theme } from 'ag-grid-community';

import { elementIconOverrides } from './parts/icon-set';

export const elementTheme: Theme = createTheme()
  .withPart(iconSetAlpine)
  .withPart(elementIconOverrides)
  .withParams({
    fontFamily: '"SiemensSans Pro", sans-serif',
    iconSize: 24,
    wrapperBorder: false,
    wrapperBorderRadius: 'var(--element-radius-2)',
    headerBackgroundColor: 'transparent !default',
    backgroundColor: 'var(--element-base-1)',
    textColor: 'var(--element-text-primary)',
    headerRowBorder: { width: '4px', color: 'var(--element-ui-4)' },
    headerColumnBorder: { width: 0 },
    headerColumnResizeHandleHeight: '100%',
    headerColumnResizeHandleColor: 'var(--element-base-0)',
    headerColumnResizeHandleWidth: '4px',
    headerTextColor: 'var(--element-text-primary)',
    headerFontWeight: '600',
    rowHoverColor: 'var(--element-base-1-hover)',
    menuTextColor: 'var(--element-text-primary)',
    selectedRowBackgroundColor: 'var(--element-base-1-selected)'
  });
