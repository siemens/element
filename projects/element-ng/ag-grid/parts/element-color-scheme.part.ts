/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { elementCheckedImageShape } from '@siemens/element-ng/icon';
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
    accentColor: 'var(--element-focus-default)',
    backgroundColor: 'var(--element-base-1)',
    borderColor: 'var(--element-ui-4)',

    // Button styles
    buttonFontWeight: '600',
    buttonActiveBackgroundColor: 'var(--element-action-secondary-hover)',
    buttonActiveBorder: {
      color: 'var(--element-action-secondary-hover)'
    },
    buttonActiveTextColor: 'var(--element-action-secondary-text-hover)',
    buttonBackgroundColor: 'var(--element-action-secondary)',
    buttonBorder: {
      color: 'var(--element-action-secondary-border)'
    },
    buttonTextColor: 'var(--element-action-secondary-text)',

    buttonHoverBackgroundColor: 'var(--element-action-secondary-hover)',
    buttonHoverBorder: {
      color: 'var(--element-action-secondary-border-hover)'
    },
    buttonHoverTextColor: 'var(--element-action-secondary-text-hover)',

    buttonDisabledBackgroundColor: 'var(--element-action-secondary)',
    buttonDisabledTextColor: 'var(--element-text-disabled)',
    buttonDisabledBorder: {
      color: 'var(--element-ui-4)'
    },

    // advanced filter builder styles
    advancedFilterBuilderButtonBarBorder: {
      color: 'var(--element-ui-4)'
    },
    advancedFilterBuilderJoinPillColor: 'var(--element-base-danger)',
    advancedFilterBuilderColumnPillColor: 'var(--element-base-success)',
    advancedFilterBuilderOptionPillColor: 'var(--element-base-warning)',
    advancedFilterBuilderValuePillColor: 'var(--element-base-information)',

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

    // checkbox styles
    checkboxIndeterminateShapeColor: 'var(--element-base-1)',
    checkboxBorderWidth: '1px',
    checkboxBorderRadius: '2px',
    checkboxCheckedShapeImage: {
      url: elementCheckedImageShape
    },
    checkboxUncheckedBackgroundColor: 'var(--element-base-1)',
    checkboxUncheckedBorderColor: 'var(--element-ui-1)',
    checkboxCheckedBackgroundColor: 'var(--element-action-primary)',
    checkboxCheckedBorderColor: 'var(--element-action-primary)',
    checkboxIndeterminateBackgroundColor: 'var(--element-action-primary)',
    checkboxIndeterminateBorderColor: 'var(--element-action-primary)',
    checkboxCheckedShapeColor: 'var(--element-action-primary-text)',

    columnHoverColor: 'var(--element-base-1-hover)',
    foregroundColor: 'var(--element-text-primary)',

    // header styles
    headerCellHoverBackgroundColor: 'var(--element-base-1-hover)',
    headerBackgroundColor: 'var(--element-base-1)',
    headerRowBorder: {
      color: 'var(--element-ui-4)'
    },
    headerColumnBorder: {
      color: 'var(--element-action-secondary)'
    },
    headerColumnResizeHandleColor: 'var(--element-ui-4)',
    headerFontWeight: '600',

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
      color: 'var(--element-focus-default)'
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
    iconSize: '18px',
    iconColor: 'var(--element-text-primary)',
    iconButtonActiveBackgroundColor: 'var(--element-base-1-selected)',
    iconButtonActiveColor: 'var(--element-action-primary-hover)',
    iconButtonActiveIndicatorColor: 'var(--element-action-primary-hover)',
    iconButtonBackgroundColor: 'var(--element-action-secondary)',
    iconButtonColor: 'var(--element-text-primary)',
    iconButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
    iconButtonHoverColor: 'var(--element-text-primary)',

    // menu styles
    menuBorder: false,
    menuShadow:
      '0 0 8px var(--element-box-shadow-color-1), 0 8px 8px var(--element-box-shadow-color-2)',
    menuBackgroundColor: 'var(--element-base-1)',

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
    dragAndDropImageBorder: false,
    dragAndDropImageShadow:
      '0 0 8px var(--element-box-shadow-color-1), 0 8px 8px var(--element-box-shadow-color-2)',
    columnDropCellBackgroundColor: 'var(--element-base-1)',
    columnDropCellDragHandleColor: 'var(--element-text-primary)',

    // range selection styles
    rangeSelectionBackgroundColor: 'var(--element-base-1-selected)',
    rangeHeaderHighlightColor: 'var(--element-base-1)',
    rangeSelectionHighlightColor: 'var(--element-base-1-selected)',
    rangeSelectionBorderColor: 'var(--element-action-primary-hover)',

    oddRowBackgroundColor: 'var(--element-base-1)',
    rowHoverColor: 'var(--element-base-1-hover)',
    chartMenuLabelColor: 'var(--element-text-primary)',
    rowLoadingSkeletonEffectColor: 'var(--element-base-1)',
    sideBarBackgroundColor: 'var(--element-base-1)',
    subtleTextColor: 'var(--element-text-secondary)',

    // side button styles
    sideButtonBackgroundColor: 'var(--element-action-secondary)',
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

    sidePanelBorder: {
      color: 'var(--element-ui-4)'
    },
    selectCellBorder: {
      color: 'var(--element-ui-4)'
    },

    // Tooltip styles
    tooltipBackgroundColor: 'var(--element-base-translucent-2)',
    tooltipTextColor: 'var(--element-text-inverse)',
    tooltipBorder: false,

    // tab styles
    tabSelectedTextColor: 'var(--element-action-primary)',
    tabSelectedUnderlineColor: 'var(--element-action-secondary)',
    tabBackgroundColor: 'var(--element-action-secondary)',
    tabBarBackgroundColor: 'var(--element-base-1)',
    tabBarBorder: {
      color: 'var(--element-ui-4)'
    },
    tabHoverBackgroundColor: 'var(--element-action-secondary)',

    focusShadow: false,
    wrapperBorder: false
  } satisfies Partial<ThemeDefaultParams>
});
