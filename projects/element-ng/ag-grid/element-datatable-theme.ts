/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Part, createPart } from 'ag-grid-community';


const baseParams = {
    cellBatchEditBackgroundColor: 'rgba(220 181 139 / 16%)',
    cellBatchEditTextColor: '#422f00',

    rowBatchEditBackgroundColor: {
        ref: 'cellBatchEditBackgroundColor',
    },
    rowBatchEditTextColor: {
        ref: 'cellBatchEditTextColor',
    },
};

export const baseDarkBatchEditParams = {
    ...baseParams,
    cellBatchEditTextColor: '#f3d0b3',
};

const defaultLightColorSchemeParams = {
    backgroundColor: '#fff',
    foregroundColor: '#181d1f',
    browserColorScheme: 'light',
} as const;

const darkParams = () =>
    ({
        ...defaultLightColorSchemeParams,
        ...baseDarkBatchEditParams,
        backgroundColor: 'hsl(217, 0%, 17%)',
        foregroundColor: '#FFF',
        browserColorScheme: 'dark',
        popupShadow: 'var(--popover-box-shadow)',
        cardShadow: '0 1px 4px 1px #000A',
        advancedFilterBuilderJoinPillColor: '#7a3a37',
        advancedFilterBuilderColumnPillColor: '#355f2d',
        advancedFilterBuilderOptionPillColor: '#5a3168',
        advancedFilterBuilderValuePillColor: '#374c86',
    }) as const;


/**
 *
 * @returns A part that defines the color scheme for the Element AG Grid theme.
 */
export const elementColorScheme = (): Part =>
  createPart({
    params: {
      backgroundColor: 'var(--element-base-1)',
      headerBackgroundColor: 'transparent',
      textColor: 'var(--element-text-primary)',
      rowHoverColor: 'var(--element-base-1-hover)',
      selectedRowBackgroundColor: 'var(--element-base-1-selected)',
      headerHeight: '40px',
      headerFontWeight: '700',
      iconSize: '18px'
    }
});

export const colorScheme = (): Part => createPart({
  feature: 'colorScheme',
  params: defaultLightColorSchemeParams,
  modeParams: {
    light: defaultLightColorSchemeParams,
    dark: darkParams()
  }
})
