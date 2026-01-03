/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { elementCheckedImageShape } from '@siemens/element-ng/icon';
import { Part, ThemeDefaultParams, createPart } from 'ag-grid-community';

/**
 * Creates a comprehensive color scheme part for the Element AG Grid theme.
 *
 * This part applies Element design system colors and styling to all AG Grid components,
 * including:
 * - Typography (fonts, weights, sizes)
 * - Base colors (backgrounds, borders, foreground)
 * - Interactive elements (buttons, inputs, icons)
 * - Cell and row styling (hover, selection, borders)
 * - Header components
 * - Checkboxes and form controls
 * - Menus, dialogs, and overlays
 * - Tooltips and tabs
 * - Charts and visualizations
 *
 * All colors are mapped to CSS custom properties from the Element design system,
 * ensuring consistency with other Element components and automatic theme support.
 *
 * @returns A part that defines the complete color scheme for the Element AG Grid theme.
 */
export const elementColorScheme: Part = createPart({
  feature: 'colorScheme',
  params: {
    // Typography
    buttonFontWeight: '600',
    cellFontFamily: 'var(--element-body-font-family)',
    fontFamily: 'var(--element-body-font-family)',
    fontSize: '14px',
    headerFontWeight: '600',

    // Base colors:
    accentColor: 'var(--element-focus-default)',
    backgroundColor: 'var(--element-base-1)',
    borderColor: 'var(--element-ui-4)',
    foregroundColor: 'var(--element-text-primary)',
    invalidColor: 'var(--element-status-danger)',
    subtleTextColor: 'var(--element-text-secondary)',

    // Button styles
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

    // Advanced filter builder styles
    advancedFilterBuilderButtonBarBorder: {
      color: 'var(--element-ui-4)'
    },
    advancedFilterBuilderJoinPillColor: 'var(--element-base-danger)',
    advancedFilterBuilderColumnPillColor: 'var(--element-base-success)',
    advancedFilterBuilderOptionPillColor: 'var(--element-base-warning)',
    advancedFilterBuilderValuePillColor: 'var(--element-base-information)',

    // Cell styles
    cellEditingBorder: {
      color: 'var(--element-action-primary)'
    },
    cellTextColor: 'var(--element-text-primary)',

    // Column styles
    columnBorder: {
      color: 'var(--element-action-secondary)'
    },
    columnDropCellBackgroundColor: 'var(--element-base-1)',
    columnDropCellBorder: {
      color: 'var(--element-action-secondary)'
    },
    columnDropCellDragHandleColor: 'var(--element-text-primary)',
    columnDropCellTextColor: 'var(--element-text-primary)',
    columnHoverColor: 'var(--element-base-1-hover)',

    // Row styles
    oddRowBackgroundColor: 'var(--element-base-1)',
    rowBorder: {
      color: 'var(--element-ui-4)'
    },
    rowHoverColor: 'var(--element-base-1-hover)',
    rowLoadingSkeletonEffectColor: 'var(--element-base-1)',
    selectedRowBackgroundColor: 'var(--element-base-1-selected)',

    // Dialog and footer styles
    footerRowBorder: {
      color: 'var(--element-ui-4)'
    },
    dialogBorder: {
      color: 'var(--element-ui-4)'
    },

    // Checkbox styles
    checkboxBorderRadius: '2px',
    checkboxBorderWidth: '1px',
    checkboxCheckedBackgroundColor: 'var(--element-action-primary)',
    checkboxCheckedBorderColor: 'var(--element-action-primary)',
    checkboxCheckedShapeColor: 'var(--element-action-primary-text)',
    checkboxCheckedShapeImage: {
      url: elementCheckedImageShape
    },
    checkboxIndeterminateBackgroundColor: 'var(--element-action-primary)',
    checkboxIndeterminateBorderColor: 'var(--element-action-primary)',
    checkboxIndeterminateShapeColor: 'var(--element-base-1)',
    checkboxUncheckedBackgroundColor: 'var(--element-base-1)',
    checkboxUncheckedBorderColor: 'var(--element-ui-1)',

    // Header styles
    headerBackgroundColor: 'var(--element-base-1)',
    headerCellHoverBackgroundColor: 'var(--element-base-1-hover)',
    headerColumnBorder: {
      color: 'var(--element-action-secondary)'
    },
    headerColumnResizeHandleColor: 'var(--element-ui-4)',
    headerRowBorder: {
      color: 'var(--element-ui-4)'
    },

    // Input styles
    inputBackgroundColor: 'var(--element-base-1)',
    inputBorder: {
      color: 'var(--element-ui-2)'
    },
    inputBorderRadius: '2px',
    inputDisabledBackgroundColor: 'var(--element-base-1)',
    inputDisabledBorder: {
      color: 'var(--element-ui-3)'
    },
    inputDisabledTextColor: 'var(--element-text-disabled)',
    inputFocusBorder: {
      color: 'var(--element-focus-default)'
    },
    inputFocusShadow: false,
    inputIconColor: 'var(--element-ui-1)',
    inputInvalidBorder: {
      color: 'var(--element-status-danger)'
    },
    inputTextColor: 'var(--element-text-primary)',

    // Icon styles
    iconButtonActiveBackgroundColor: 'var(--element-base-1-selected)',
    iconButtonActiveColor: 'var(--element-action-primary-hover)',
    iconButtonActiveIndicatorColor: 'var(--element-action-primary-hover)',
    iconButtonBackgroundColor: 'var(--element-action-secondary)',
    iconButtonColor: 'var(--element-text-primary)',
    iconButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
    iconButtonHoverColor: 'var(--element-text-primary)',
    iconColor: 'var(--element-text-primary)',
    iconSize: '18px',

    // Menu styles
    menuBackgroundColor: 'var(--element-base-1)',
    menuBorder: false,
    menuShadow:
      '0 0 8px var(--element-box-shadow-color-1), 0 8px 8px var(--element-box-shadow-color-2)',

    // Pinning styles
    pinnedColumnBorder: {
      color: 'var(--element-base-1-selected)'
    },
    pinnedRowBorder: {
      color: 'var(--element-base-1-selected)'
    },

    // Drag and drop styles
    dragAndDropImageBackgroundColor: 'var(--element-base-3)',
    dragAndDropImageBorder: false,
    dragAndDropImageShadow:
      '0 0 8px var(--element-box-shadow-color-1), 0 8px 8px var(--element-box-shadow-color-2)',
    dragHandleColor: 'var(--element-text-primary)',

    // Range selection styles
    rangeHeaderHighlightColor: 'var(--element-base-1)',
    rangeSelectionBackgroundColor: 'var(--element-base-1-selected)',
    rangeSelectionBorderColor: 'var(--element-action-primary-hover)',
    rangeSelectionHighlightColor: 'var(--element-base-1-selected)',

    // Sidebar styles
    sideBarBackgroundColor: 'var(--element-base-1)',
    sidePanelBorder: {
      color: 'var(--element-ui-4)'
    },

    // Side button styles
    sideButtonBackgroundColor: 'var(--element-action-secondary)',
    sideButtonBarBackgroundColor: 'var(--element-base-1)',
    sideButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
    sideButtonSelectedBackgroundColor: 'var(--element-base-1-selected)',
    sideButtonSelectedBorder: 'var(--element-action-secondary-border)',
    sideButtonSelectedUnderlineColor: 'var(--element-base-1-selected)',

    // Status bar styles
    statusBarLabelColor: 'var(--element-text-primary)',
    statusBarValueColor: 'var(--element-text-primary)',

    // Select cell styles
    selectCellBorder: {
      color: 'var(--element-ui-4)'
    },

    // Toggle button styles - matching Element switch design
    toggleButtonHeight: '20px',
    toggleButtonOffBackgroundColor: 'var(--element-ui-4)',
    toggleButtonOnBackgroundColor: 'var(--element-ui-0)',
    toggleButtonSwitchBackgroundColor: 'var(--element-ui-2)',
    toggleButtonSwitchInset: '4px',
    toggleButtonWidth: '40px',

    // Value change styles
    valueChangeDeltaDownColor: 'var(--element-status-danger)',
    valueChangeDeltaUpColor: 'var(--element-status-success)',
    valueChangeValueHighlightBackgroundColor: 'var(--element-base-1-selected)',

    // Tooltip styles
    tooltipBackgroundColor: 'var(--element-base-translucent-2)',
    tooltipBorder: false,
    tooltipTextColor: 'var(--element-text-inverse)',

    // Tab styles
    tabBackgroundColor: 'var(--element-action-secondary)',
    tabBarBackgroundColor: 'var(--element-base-1)',
    tabBarBorder: {
      color: 'var(--element-ui-4)'
    },
    tabHoverBackgroundColor: 'var(--element-action-secondary)',
    tabSelectedTextColor: 'var(--element-action-primary)',
    tabSelectedUnderlineColor: 'var(--element-action-secondary)',

    // Chart styles
    chartMenuLabelColor: 'var(--element-text-primary)',

    // Misc styles
    focusShadow: false,
    wrapperBorder: false
  } satisfies Partial<ThemeDefaultParams>
});
