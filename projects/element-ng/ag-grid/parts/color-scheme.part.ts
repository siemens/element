/**
 * Copyright (c) Siemens 2016 - 2026
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
  css: `
    .ag-header-cell:focus-visible,
    .ag-header-group-cell:focus-visible {
      outline: var(--element-button-focus-width) solid var(--element-focus-default);
      outline-offset: calc(-1 * var(--element-button-focus-width));
    }
  `,
  params: {
    // Typography
    buttonFontWeight: '600',
    cellFontFamily: 'var(--element-body-font-family)',
    fontFamily: 'var(--element-body-font-family)',
    fontSize: '14px',
    headerFontWeight: '600',

    // Base colors:
    accentColor: 'var(--si-sys-color-effects-focus)',
    backgroundColor: 'var(--si-sys-color-background-1)',
    borderColor: 'var(--si-sys-color-border-4)',
    foregroundColor: 'var(--si-sys-color-text-primary)',
    invalidColor: 'var(--si-sys-color-background-danger)',
    subtleTextColor: 'var(--si-sys-color-text-secondary)',

    // Button styles
    buttonActiveBackgroundColor: 'var(--si-sys-color-background-accent-secondary-hover)',
    buttonActiveBorder: {
      color: 'var(--si-sys-color-background-accent-secondary-hover)'
    },
    buttonActiveTextColor: 'var(--si-sys-color-text-accent-hover)',
    buttonBackgroundColor: 'var(--si-sys-color-background-accent-secondary)',
    buttonBorder: {
      color: 'var(--si-sys-color-border-accent)'
    },
    buttonTextColor: 'var(--si-sys-color-text-accent)',

    buttonHoverBackgroundColor: 'var(--si-sys-color-background-accent-secondary-hover)',
    buttonHoverBorder: {
      color: 'var(--si-sys-color-border-accent-hover)'
    },
    buttonHoverTextColor: 'var(--si-sys-color-text-accent-hover)',

    buttonDisabledBackgroundColor: 'var(--si-sys-color-background-accent-secondary)',
    buttonDisabledTextColor: 'var(--si-sys-color-text-disabled)',
    buttonDisabledBorder: {
      color: 'var(--si-sys-color-border-4)'
    },

    // Advanced filter builder styles
    advancedFilterBuilderButtonBarBorder: {
      color: 'var(--si-sys-color-border-4)'
    },
    advancedFilterBuilderJoinPillColor: 'var(--si-sys-color-background-danger-subtle)',
    advancedFilterBuilderColumnPillColor: 'var(--si-sys-color-background-success-subtle)',
    advancedFilterBuilderOptionPillColor: 'var(--si-sys-color-background-warning-subtle)',
    advancedFilterBuilderValuePillColor: 'var(--si-sys-color-background-information-subtle)',

    // Cell styles
    cellEditingBorder: {
      color: 'var(--si-sys-color-background-accent)'
    },
    cellTextColor: 'var(--si-sys-color-text-primary)',

    // Column styles
    columnBorder: {
      color: 'var(--si-sys-color-background-accent-secondary)'
    },
    columnDropCellBackgroundColor: 'var(--si-sys-color-background-1)',
    columnDropCellBorder: {
      color: 'var(--si-sys-color-background-accent-secondary)'
    },
    columnDropCellDragHandleColor: 'var(--si-sys-color-text-primary)',
    columnDropCellTextColor: 'var(--si-sys-color-text-primary)',
    columnHoverColor: 'var(--si-sys-color-background-hover)',

    // Row styles
    oddRowBackgroundColor: 'var(--si-sys-color-background-1)',
    rowBorder: {
      color: 'var(--si-sys-color-border-4)'
    },
    rowHoverColor: 'var(--si-sys-color-background-hover)',
    rowLoadingSkeletonEffectColor: 'var(--si-sys-color-background-1)',
    selectedRowBackgroundColor: 'var(--si-sys-color-background-active)',

    // Dialog and footer styles
    footerRowBorder: {
      color: 'var(--si-sys-color-border-4)'
    },
    dialogBorder: {
      color: 'var(--si-sys-color-border-4)'
    },

    // Checkbox styles
    checkboxBorderRadius: '2px',
    checkboxBorderWidth: '1px',
    checkboxCheckedBackgroundColor: 'var(--si-sys-color-background-accent)',
    checkboxCheckedBorderColor: 'var(--si-sys-color-background-accent)',
    checkboxCheckedShapeColor: 'var(--si-sys-color-text-on-accent)',
    checkboxCheckedShapeImage: {
      url: elementCheckedImageShape
    },
    checkboxIndeterminateBackgroundColor: 'var(--si-sys-color-background-accent)',
    checkboxIndeterminateBorderColor: 'var(--si-sys-color-background-accent)',
    checkboxIndeterminateShapeColor: 'var(--si-sys-color-background-1)',
    checkboxUncheckedBackgroundColor: 'var(--si-sys-color-background-1)',
    checkboxUncheckedBorderColor: 'var(--si-sys-color-border-1)',

    // Header styles
    headerBackgroundColor: 'var(--si-sys-color-background-1)',
    headerCellHoverBackgroundColor: 'var(--si-sys-color-background-hover)',
    headerColumnBorder: {
      color: 'var(--si-sys-color-background-accent-secondary)'
    },
    headerColumnResizeHandleColor: 'var(--si-sys-color-border-4)',
    headerRowBorder: {
      color: 'var(--si-sys-color-border-4)'
    },

    // Input styles
    inputBackgroundColor: 'var(--si-sys-color-background-1)',
    inputBorder: {
      color: 'var(--si-sys-color-border-2)'
    },
    inputBorderRadius: '2px',
    inputDisabledBackgroundColor: 'var(--si-sys-color-background-1)',
    inputDisabledBorder: {
      color: 'var(--si-sys-color-border-3)'
    },
    inputDisabledTextColor: 'var(--si-sys-color-text-disabled)',
    inputFocusBorder: {
      color: 'var(--si-sys-color-effects-focus)'
    },
    inputFocusShadow: false,
    inputIconColor: 'var(--si-sys-color-border-1)',
    inputInvalidBorder: {
      color: 'var(--si-sys-color-background-danger)'
    },
    inputTextColor: 'var(--si-sys-color-text-primary)',

    // Icon styles
    iconButtonActiveBackgroundColor: 'var(--si-sys-color-background-active)',
    iconButtonActiveColor: 'var(--si-sys-color-background-accent-hover)',
    iconButtonActiveIndicatorColor: 'var(--si-sys-color-background-accent-hover)',
    iconButtonBackgroundColor: 'var(--si-sys-color-background-accent-secondary)',
    iconButtonColor: 'var(--si-sys-color-text-primary)',
    iconButtonHoverBackgroundColor: 'var(--si-sys-color-background-hover)',
    iconButtonHoverColor: 'var(--si-sys-color-text-primary)',
    iconColor: 'var(--si-sys-color-text-primary)',
    iconSize: '18px',

    // Menu styles
    menuBackgroundColor: 'var(--si-sys-color-background-1)',
    menuBorder: false,
    menuShadow: 'var(--si-sys-color-effects-shadow-2)',

    // Pinning styles
    pinnedColumnBorder: {
      color: 'var(--si-sys-color-background-active)'
    },
    pinnedRowBorder: {
      color: 'var(--si-sys-color-background-active)'
    },

    // Drag and drop styles
    dragAndDropImageBackgroundColor: 'var(--si-sys-color-background-3)',
    dragAndDropImageBorder: false,
    dragAndDropImageShadow: 'var(--si-sys-color-effects-shadow-2)',
    dragHandleColor: 'var(--si-sys-color-text-primary)',

    // Range selection styles
    rangeHeaderHighlightColor: 'var(--si-sys-color-background-1)',
    rangeSelectionBackgroundColor: 'var(--si-sys-color-background-active)',
    rangeSelectionBorderColor: 'var(--si-sys-color-background-accent-hover)',
    rangeSelectionHighlightColor: 'var(--si-sys-color-background-active)',

    // Sidebar styles
    sideBarBackgroundColor: 'var(--si-sys-color-background-1)',
    sidePanelBorder: {
      color: 'var(--si-sys-color-border-4)'
    },

    // Side button styles
    sideButtonBackgroundColor: 'var(--si-sys-color-background-accent-secondary)',
    sideButtonBarBackgroundColor: 'var(--si-sys-color-background-1)',
    sideButtonHoverBackgroundColor: 'var(--si-sys-color-background-hover)',
    sideButtonSelectedBackgroundColor: 'var(--si-sys-color-background-active)',
    sideButtonSelectedBorder: 'var(--si-sys-color-border-accent)',
    sideButtonSelectedUnderlineColor: 'var(--si-sys-color-background-active)',

    // Status bar styles
    statusBarLabelColor: 'var(--si-sys-color-text-primary)',
    statusBarValueColor: 'var(--si-sys-color-text-primary)',

    // Select cell styles
    selectCellBorder: {
      color: 'var(--si-sys-color-border-4)'
    },

    // Toggle button styles - matching Element switch design
    toggleButtonHeight: '20px',
    toggleButtonOffBackgroundColor: 'var(--si-sys-color-background-neutral)',
    toggleButtonOnBackgroundColor: 'var(--si-sys-color-background-accent)',
    toggleButtonSwitchBackgroundColor: 'var(--si-sys-color-background-inverse)',
    toggleButtonSwitchInset: '4px',
    toggleButtonWidth: '40px',

    // Value change styles
    valueChangeDeltaDownColor: 'var(--si-sys-color-background-danger)',
    valueChangeDeltaUpColor: 'var(--si-sys-color-background-success)',
    valueChangeValueHighlightBackgroundColor: 'var(--si-sys-color-background-active)',

    // Tooltip styles
    tooltipBackgroundColor: 'var(--si-sys-color-background-inverse)',
    tooltipBorder: false,
    tooltipTextColor: 'var(--si-sys-color-text-inverse)',

    // Tab styles
    tabBackgroundColor: 'var(--si-sys-color-background-accent-secondary)',
    tabBarBackgroundColor: 'var(--si-sys-color-background-1)',
    tabBarBorder: {
      color: 'var(--si-sys-color-border-4)'
    },
    tabHoverBackgroundColor: 'var(--si-sys-color-background-accent-secondary)',
    tabSelectedTextColor: 'var(--si-sys-color-background-accent)',
    tabSelectedUnderlineColor: 'var(--si-sys-color-background-accent-secondary)',

    // Chart styles
    chartMenuLabelColor: 'var(--si-sys-color-text-primary)',

    // Misc styles
    focusShadow: false,
    wrapperBorder: false
  } satisfies Partial<ThemeDefaultParams>
});
