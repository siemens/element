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
    accentColor: 'var(--si-sys-effects-focus)',
    backgroundColor: 'var(--si-sys-background-1)',
    borderColor: 'var(--si-sys-border-4)',
    foregroundColor: 'var(--si-sys-text-primary)',
    invalidColor: 'var(--si-sys-background-danger)',
    subtleTextColor: 'var(--si-sys-text-secondary)',

    // Button styles
    buttonActiveBackgroundColor: 'var(--si-sys-background-accent-secondary-hover)',
    buttonActiveBorder: {
      color: 'var(--si-sys-background-accent-secondary-hover)'
    },
    buttonActiveTextColor: 'var(--si-sys-text-accent-hover)',
    buttonBackgroundColor: 'var(--si-sys-background-accent-secondary)',
    buttonBorder: {
      color: 'var(--si-sys-border-accent)'
    },
    buttonTextColor: 'var(--si-sys-text-accent)',

    buttonHoverBackgroundColor: 'var(--si-sys-background-accent-secondary-hover)',
    buttonHoverBorder: {
      color: 'var(--si-sys-border-accent-hover)'
    },
    buttonHoverTextColor: 'var(--si-sys-text-accent-hover)',

    buttonDisabledBackgroundColor: 'var(--si-sys-background-accent-secondary)',
    buttonDisabledTextColor: 'var(--si-sys-text-disabled)',
    buttonDisabledBorder: {
      color: 'var(--si-sys-border-4)'
    },

    // Advanced filter builder styles
    advancedFilterBuilderButtonBarBorder: {
      color: 'var(--si-sys-border-4)'
    },
    advancedFilterBuilderJoinPillColor: 'var(--si-sys-background-danger-subtle)',
    advancedFilterBuilderColumnPillColor: 'var(--si-sys-background-success-subtle)',
    advancedFilterBuilderOptionPillColor: 'var(--si-sys-background-warning-subtle)',
    advancedFilterBuilderValuePillColor: 'var(--si-sys-background-information-subtle)',

    // Cell styles
    cellEditingBorder: {
      color: 'var(--si-sys-background-accent)'
    },
    cellTextColor: 'var(--si-sys-text-primary)',

    // Column styles
    columnBorder: {
      color: 'var(--si-sys-background-accent-secondary)'
    },
    columnDropCellBackgroundColor: 'var(--si-sys-background-1)',
    columnDropCellBorder: {
      color: 'var(--si-sys-background-accent-secondary)'
    },
    columnDropCellDragHandleColor: 'var(--si-sys-text-primary)',
    columnDropCellTextColor: 'var(--si-sys-text-primary)',
    columnHoverColor: 'var(--si-sys-background-hover)',

    // Row styles
    oddRowBackgroundColor: 'var(--si-sys-background-1)',
    rowBorder: {
      color: 'var(--si-sys-border-4)'
    },
    rowHoverColor: 'var(--si-sys-background-hover)',
    rowLoadingSkeletonEffectColor: 'var(--si-sys-background-1)',
    selectedRowBackgroundColor: 'var(--si-sys-background-selected)',

    // Dialog and footer styles
    footerRowBorder: {
      color: 'var(--si-sys-border-4)'
    },
    dialogBorder: {
      color: 'var(--si-sys-border-4)'
    },

    // Checkbox styles
    checkboxBorderRadius: '2px',
    checkboxBorderWidth: '1px',
    checkboxCheckedBackgroundColor: 'var(--si-sys-background-accent)',
    checkboxCheckedBorderColor: 'var(--si-sys-background-accent)',
    checkboxCheckedShapeColor: 'var(--si-sys-text-on-accent)',
    checkboxCheckedShapeImage: {
      url: elementCheckedImageShape
    },
    checkboxIndeterminateBackgroundColor: 'var(--si-sys-background-accent)',
    checkboxIndeterminateBorderColor: 'var(--si-sys-background-accent)',
    checkboxIndeterminateShapeColor: 'var(--si-sys-background-1)',
    checkboxUncheckedBackgroundColor: 'var(--si-sys-background-1)',
    checkboxUncheckedBorderColor: 'var(--si-sys-border-1)',

    // Header styles
    headerBackgroundColor: 'var(--si-sys-background-1)',
    headerCellHoverBackgroundColor: 'var(--si-sys-background-hover)',
    headerColumnBorder: {
      color: 'var(--si-sys-background-accent-secondary)'
    },
    headerColumnResizeHandleColor: 'var(--si-sys-border-4)',
    headerRowBorder: {
      color: 'var(--si-sys-border-4)'
    },

    // Input styles
    inputBackgroundColor: 'var(--si-sys-background-1)',
    inputBorder: {
      color: 'var(--si-sys-border-2)'
    },
    inputBorderRadius: '2px',
    inputDisabledBackgroundColor: 'var(--si-sys-background-1)',
    inputDisabledBorder: {
      color: 'var(--si-sys-border-3)'
    },
    inputDisabledTextColor: 'var(--si-sys-text-disabled)',
    inputFocusBorder: {
      color: 'var(--si-sys-effects-focus)'
    },
    inputFocusShadow: false,
    inputIconColor: 'var(--si-sys-border-1)',
    inputInvalidBorder: {
      color: 'var(--si-sys-background-danger)'
    },
    inputTextColor: 'var(--si-sys-text-primary)',

    // Icon styles
    iconButtonActiveBackgroundColor: 'var(--si-sys-background-selected)',
    iconButtonActiveColor: 'var(--si-sys-background-accent-hover)',
    iconButtonActiveIndicatorColor: 'var(--si-sys-background-accent-hover)',
    iconButtonBackgroundColor: 'var(--si-sys-background-accent-secondary)',
    iconButtonColor: 'var(--si-sys-text-primary)',
    iconButtonHoverBackgroundColor: 'var(--si-sys-background-hover)',
    iconButtonHoverColor: 'var(--si-sys-text-primary)',
    iconColor: 'var(--si-sys-text-primary)',
    iconSize: '18px',

    // Menu styles
    menuBackgroundColor: 'var(--si-sys-background-1)',
    menuBorder: false,
    menuShadow: 'var(--si-sys-effects-shadow-2)',

    // Pinning styles
    pinnedColumnBorder: {
      color: 'var(--si-sys-background-selected)'
    },
    pinnedRowBorder: {
      color: 'var(--si-sys-background-selected)'
    },

    // Drag and drop styles
    dragAndDropImageBackgroundColor: 'var(--si-sys-background-3)',
    dragAndDropImageBorder: false,
    dragAndDropImageShadow: 'var(--si-sys-effects-shadow-2)',
    dragHandleColor: 'var(--si-sys-text-primary)',

    // Range selection styles
    rangeHeaderHighlightColor: 'var(--si-sys-background-1)',
    rangeSelectionBackgroundColor: 'var(--si-sys-background-selected)',
    rangeSelectionBorderColor: 'var(--si-sys-background-accent-hover)',
    rangeSelectionHighlightColor: 'var(--si-sys-background-selected)',

    // Sidebar styles
    sideBarBackgroundColor: 'var(--si-sys-background-1)',
    sidePanelBorder: {
      color: 'var(--si-sys-border-4)'
    },

    // Side button styles
    sideButtonBackgroundColor: 'var(--si-sys-background-accent-secondary)',
    sideButtonBarBackgroundColor: 'var(--si-sys-background-1)',
    sideButtonHoverBackgroundColor: 'var(--si-sys-background-hover)',
    sideButtonSelectedBackgroundColor: 'var(--si-sys-background-selected)',
    sideButtonSelectedBorder: 'var(--si-sys-border-accent)',
    sideButtonSelectedUnderlineColor: 'var(--si-sys-background-selected)',

    // Status bar styles
    statusBarLabelColor: 'var(--si-sys-text-primary)',
    statusBarValueColor: 'var(--si-sys-text-primary)',

    // Select cell styles
    selectCellBorder: {
      color: 'var(--si-sys-border-4)'
    },

    // Toggle button styles - matching Element switch design
    toggleButtonHeight: '20px',
    toggleButtonOffBackgroundColor: 'var(--si-sys-background-neutral)',
    toggleButtonOnBackgroundColor: 'var(--si-sys-background-accent)',
    toggleButtonSwitchBackgroundColor: 'var(--si-sys-background-inverse)',
    toggleButtonSwitchInset: '4px',
    toggleButtonWidth: '40px',

    // Value change styles
    valueChangeDeltaDownColor: 'var(--si-sys-background-danger)',
    valueChangeDeltaUpColor: 'var(--si-sys-background-success)',
    valueChangeValueHighlightBackgroundColor: 'var(--si-sys-background-selected)',

    // Tooltip styles
    tooltipBackgroundColor: 'var(--si-sys-background-inverse)',
    tooltipBorder: false,
    tooltipTextColor: 'var(--si-sys-text-inverse)',

    // Tab styles
    tabBackgroundColor: 'var(--si-sys-background-accent-secondary)',
    tabBarBackgroundColor: 'var(--si-sys-background-1)',
    tabBarBorder: {
      color: 'var(--si-sys-border-4)'
    },
    tabHoverBackgroundColor: 'var(--si-sys-background-accent-secondary)',
    tabSelectedTextColor: 'var(--si-sys-background-accent)',
    tabSelectedUnderlineColor: 'var(--si-sys-background-accent-secondary)',

    // Chart styles
    chartMenuLabelColor: 'var(--si-sys-text-primary)',

    // Misc styles
    focusShadow: false,
    wrapperBorder: false
  } satisfies Partial<ThemeDefaultParams>
});
