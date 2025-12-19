/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Part, ThemeDefaultParams, createPart } from 'ag-grid-community';

/**
 * Creates a color scheme part for the Element AG Grid theme.
 * This part applies Element design system colors to all AG Grid components.
 *
 * @returns A part that defines the color scheme for the Element AG Grid theme.
 */
export const elementColorScheme: Part = createPart({
  feature: 'colorScheme',
  params: {
    // size:
    cellFontFamily: 'var(--element-body-font-family)',
    fontFamily: 'var(--element-body-font-family)',
    fontSize: '14px',
    headerFontWeight: '600',

    // Standard sizes
    rowHeight: '42px',
    headerHeight: '48px',
    spacing: '8px',

    accentColor: 'var(--element-focus-default)',
    advancedFilterBuilderButtonBarBorder: 'var(--element-ui-4)',
    advancedFilterBuilderJoinPillColor: 'var(--element-base-danger)',
    advancedFilterBuilderColumnPillColor: 'var(--element-base-success)',
    advancedFilterBuilderOptionPillColor: 'var(--element-base-warning)',
    advancedFilterBuilderValuePillColor: 'var(--element-base-information)',
    backgroundColor: 'var(--element-base-1)',
    borderColor: 'var(--element-ui-4)',

    // Button styles
    buttonFontWeight: '600',
    buttonActiveBackgroundColor: 'var(--element-base-1-selected)',
    buttonActiveTextColor: 'var(--element-text-primary)',
    buttonBackgroundColor: 'var(--element-action-secondary)',
    buttonDisabledBackgroundColor: 'var(--element-action-secondary)',
    buttonDisabledTextColor: 'var(--element-text-disabled)',
    buttonHoverBackgroundColor: 'var(--element-base-1-hover)',
    buttonHoverTextColor: 'var(--element-text-primary)',
    buttonTextColor: 'var(--element-text-primary)',
    buttonActiveBorder: {
      color: 'var(--element-ui-3)'
    },
    buttonBorder: {
      color: 'var(--element-ui-3)'
    },
    buttonDisabledBorder: {
      color: 'var(--element-ui-4)'
    },
    buttonHoverBorder: {
      color: 'var(--element-ui-3)'
    },

    columnDropCellTextColor: 'var(--element-text-primary)',
    cellTextColor: 'var(--element-text-primary)',
    cellEditingBorder: {
      color: 'var(--element-action-primary)'
    },
    columnDropCellBorder: {
      color: 'var(--element-action-secondary)'
    },
    columnBorder: {
      color: 'var(--element-action-secondary)'
    },
    footerRowBorder: {
      color: 'var(--element-ui-4)'
    },

    dialogBorder: {
      color: 'var(--element-ui-4)'
    },
    headerRowBorder: {
      color: 'var(--element-ui-4)'
    },
    headerColumnBorder: {
      color: 'var(--element-action-secondary)'
    },
    // checkbox styles
    checkboxIndeterminateShapeColor: 'var(--element-base-1)',
    checkboxBorderWidth: '1px',
    checkboxBorderRadius: '2px',
    checkboxCheckedShapeImage: {
      url: 'data:image/svg+xml;base64,PHN2ZyBpZD0iSWNvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+CiAgPHRpdGxlPm9rPC90aXRsZT4KICA8cGF0aCBkPSJNMzc5LjUxLDE1Ni43NmwtMTczLDE3My03NC03NGExMiwxMiwwLDEsMC0xNywxN2w4Mi41LDgyLjVhMTIsMTIsMCwwLDAsMTcsMGwxODEuNS0xODEuNWExMiwxMiwwLDAsMC0xNy0xN1oiLz4KPC9zdmc+Cg=='
    },
    checkboxUncheckedBackgroundColor: 'var(--element-base-1)',
    checkboxUncheckedBorderColor: 'var(--element-ui-1)',
    checkboxCheckedBackgroundColor: 'var(--element-action-primary)',
    checkboxCheckedBorderColor: 'var(--element-action-primary)',
    checkboxIndeterminateBackgroundColor: 'var(--element-action-primary)',
    checkboxIndeterminateBorderColor: 'var(--element-action-primary)',
    checkboxCheckedShapeColor: 'var(--element-action-primary-text)',

    columnHoverColor: 'var(--element-base-1-hover)',
    columnDropCellBackgroundColor: 'var(--element-base-1)',
    columnDropCellDragHandleColor: 'var(--element-text-primary)',
    foregroundColor: 'var(--element-text-primary)',

    headerCellHoverBackgroundColor: 'var(--element-base-1-hover)',
    headerBackgroundColor: 'var(--element-base-1)',

    // input styles
    inputBackgroundColor: 'var(--element-base-1)',
    inputDisabledBackgroundColor: 'var(--element-base-1)',
    inputDisabledBorder: {
      color: 'var(--element-ui-3)'
    },
    inputTextColor: 'var(--element-text-primary)',
    inputIconColor: 'var(--element-ui-1)',
    inputDisabledTextColor: 'var(--element-text-disabled)',
    inputBorder: {
      color: 'var(--element-ui-2)'
    },
    inputFocusBorder: {
      color: 'var(--element-ui-2)'
    },
    inputFocusShadow: false,
    inputInvalidBorder: {
      color: 'var(--element-status-danger)'
    },
    inputBorderRadius: '2px',
    invalidColor: 'var(--element-status-danger)',

    rowBorder: {
      color: 'var(--element-ui-4)'
    },

    // icon styles
    iconColor: 'var(--element-text-primary)',
    iconButtonActiveBackgroundColor: 'var(--element-base-1-selected)',
    iconButtonActiveColor: 'var(--element-action-primary-hover)',
    iconButtonActiveIndicatorColor: 'var(--element-action-primary-hover)',
    iconButtonBackgroundColor: 'var(--element-action-secondary)',
    iconButtonColor: 'var(--element-text-primary)',
    iconButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
    iconButtonHoverColor: 'var(--element-text-primary)',

    // menu styles
    menuBorder: {
      width: '0px'
    },
    menuShadow:
      '0 0 8px var(--element-box-shadow-color-1), 0 8px 8px var(--element-box-shadow-color-2)',
    menuBackgroundColor: 'var(--element-base-1)',
    chartMenuLabelColor: 'var(--element-text-primary)',

    // pinning styles
    pinnedColumnBorder: {
      color: 'var(--element-base-1-selected)'
    },
    pinnedRowBorder: {
      color: 'var(--element-base-1-selected)'
    },

    //drag and drop styles
    dragHandleColor: 'var(--element-text-primary)',
    dragAndDropImageBackgroundColor: 'var(--element-base-3)',
    dragAndDropImageBorder: {
      width: '0px'
    },
    dragAndDropImageShadow:
      '0 0 8px var(--element-box-shadow-color-1), 0 8px 8px var(--element-box-shadow-color-2)',

    oddRowBackgroundColor: 'var(--element-base-1)',
    rowHoverColor: 'var(--element-base-1-hover)',
    rangeSelectionBackgroundColor: 'var(--element-base-1-selected)',
    rangeHeaderHighlightColor: 'var(--element-base-1)',
    rangeSelectionHighlightColor: 'var(--element-base-1-selected)',
    rangeSelectionBorderColor: 'var(--element-action-primary-hover)',
    rowLoadingSkeletonEffectColor: 'var(--element-base-1)',
    sideBarBackgroundColor: 'var(--element-base-1)',
    subtleTextColor: 'var(--element-text-secondary)',

    // side button styles
    sideButtonBackgroundColor: 'var(--element-text-secondary)',
    sideButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
    sideButtonSelectedBackgroundColor: 'var(--element-base-1-selected)',
    sideButtonSelectedBorder: 'var(--element-action-secondary-border)',
    sideButtonSelectedUnderlineColor: 'var(--element-base-1-selected)',
    sideButtonBarBackgroundColor: 'var(--element-base-1)',

    selectedRowBackgroundColor: 'var(--element-base-1-selected)',
    statusBarValueColor: 'var(--element-text-primary)',
    statusBarLabelColor: 'var(--element-text-primary)',

    // Toggle button styles - matching Element switch design
    toggleButtonWidth: '40px',
    toggleButtonHeight: '20px',
    toggleButtonSwitchInset: '4px',
    toggleButtonSwitchBackgroundColor: 'var(--element-ui-2)',
    toggleButtonOffBackgroundColor: 'var(--element-ui-4)',
    toggleButtonOnBackgroundColor: 'var(--element-ui-0)',

    valueChangeValueHighlightBackgroundColor: 'var(--element-base-1-selected)',
    valueChangeDeltaUpColor: 'var(--element-status-success)',
    valueChangeDeltaDownColor: 'var(--element-status-danger)',
    headerColumnResizeHandleColor: 'var(--element-ui-4)',
    sidePanelBorder: {
      color: 'var(--element-ui-4)'
    },
    selectCellBorder: {
      color: 'var(--element-ui-4)'
    },

    // Tooltip styles
    tooltipBackgroundColor: 'var(--element-base-translucent-2)',
    tooltipTextColor: 'var(--element-text-inverse)',
    tooltipBorder: {
      width: '0'
    },

    // tab styles
    tabSelectedTextColor: 'var(--element-action-primary)',
    tabSelectedUnderlineColor: 'var(--element-action-secondary)',
    tabBackgroundColor: 'var(--element-action-secondary)',
    tabBarBackgroundColor: 'var(--element-base-1)',
    tabBarBorder: {
      color: 'var(--element-ui-4)'
    },
    tabHoverBackgroundColor: 'var(--element-action-secondary)',

    focusShadow: false
  } satisfies Partial<ThemeDefaultParams>
});
