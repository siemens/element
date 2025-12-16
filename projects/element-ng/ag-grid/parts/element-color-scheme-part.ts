/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Part, ThemeDefaultParams, createPart } from 'ag-grid-community';

/**
 *
 * @returns A part that defines the color scheme for the Element AG Grid theme.
 */
export const elementColorScheme = (): Part =>
  createPart({
    feature: 'colorScheme',
    params: {
      // size:
      buttonFontWeight: '600',
      cellFontFamily: '"SiemensSans Pro VF", sans-serif',
      fontFamily: '"SiemensSans Pro VF", sans-serif',
      headerFontWeight: '600',
      // Standard sizes
      rowHeight: '42px',
      headerHeight: '48px',
      spacing: '8px',

      // colors:
      accentColor: 'var(--element-focus-default)',
      advancedFilterBuilderButtonBarBorder: 'var(--element-ui-4)',
      advancedFilterBuilderJoinPillColor: 'var(--element-base-danger)',
      advancedFilterBuilderColumnPillColor: 'var(--element-base-success)',
      advancedFilterBuilderOptionPillColor: 'var(--element-base-warning)',
      advancedFilterBuilderValuePillColor: 'var(--element-base-information)',
      backgroundColor: 'var(--element-base-1)',
      borderColor: 'var(--element-ui-4)',
      buttonActiveBackgroundColor: 'var(--element-base-1-selected)',
      buttonActiveTextColor: 'var(--element-text-primary)',
      buttonBackgroundColor: 'var(--element-action-secondary)',
      buttonDisabledBackgroundColor: 'var(--element-action-secondary)',
      buttonDisabledTextColor: 'var(--element-text-disabled)',
      buttonHoverBackgroundColor: 'var(--element-base-1-hover)',
      buttonHoverTextColor: 'var(--element-text-primary)',
      buttonTextColor: 'var(--element-text-primary)',
      columnDropCellTextColor: 'var(--element-text-primary)',
      checkboxIndeterminateShapeColor: 'var(--element-base-1)',
      cellTextColor: 'var(--element-text-primary)',
      columnHoverColor: 'var(--element-base-1-hover)',
      columnDropCellBackgroundColor: 'var(--element-base-1)',
      columnDropCellDragHandleColor: 'var(--element-text-primary)',
      foregroundColor: 'var(--element-text-primary)',
      dragHandleColor: 'var(--element-text-primary)',
      dragAndDropImageBackgroundColor: 'var(--element-base-1)',
      headerCellHoverBackgroundColor: 'var(--element-base-1-hover)',
      headerBackgroundColor: 'var(--element-base-1)',
      iconColor: 'var(--element-text-primary)',
      inputBackgroundColor: 'var(--element-base-1)',
      inputDisabledBackgroundColor: 'var(--element-base-1)',
      inputDisabledBorder: 'var(--element-ui-3)',
      inputTextColor: 'var(--element-text-primary)',
      inputIconColor: 'var(--element-ui-1)',
      inputDisabledTextColor: 'var(--element-text-disabled)',
      invalidColor: 'var(--element-status-danger)',
      iconButtonActiveBackgroundColor: 'var(--element-base-1-selected)',
      iconButtonActiveColor: 'var(--element-action-primary-hover)',
      iconButtonActiveIndicatorColor: 'var(--element-action-primary-hover)',
      iconButtonBackgroundColor: 'var(--element-action-secondary)',
      iconButtonColor: 'var(--element-text-primary)',
      iconButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
      iconButtonHoverColor: 'var(--element-text-primary)',
      menuBackgroundColor: 'var(--element-base-1)',
      oddRowBackgroundColor: 'var(--element-base-1)',
      pinnedRowBackgroundColor: 'var(--element-base-1-selected)',
      rowHoverColor: 'var(--element-base-1-hover)',
      rangeSelectionBackgroundColor: 'var(--element-base-1-selected)',
      rangeHeaderHighlightColor: 'var(--element-base-1)',
      rangeSelectionHighlightColor: 'var(--element-base-1-selected)',
      rangeSelectionBorderColor: 'var(--element-action-primary-hover)',
      rowLoadingSkeletonEffectColor: 'var(--element-base-1)',
      sideBarBackgroundColor: 'var(--element-base-1)',
      subtleTextColor: 'var(--element-text-secondary)',
      sideButtonHoverBackgroundColor: 'var(--element-base-1-hover)',
      sideButtonSelectedBackgroundColor: 'var(--element-base-1-selected)',
      sideButtonSelectedBorder: 'var(--element-action-secondary-border)',
      sideButtonSelectedUnderlineColor: 'var(--element-base-1-selected)',
      selectedRowBackgroundColor: 'var(--element-base-1-selected)',
      statusBarValueColor: 'var(--element-text-primary)',
      statusBarLabelColor: 'var(--element-text-primary)',
      tabSelectedTextColor: 'var(--element-action-primary)',
      tabSelectedUnderlineColor: 'var(--element-action-secondary)',
      toggleButtonSwitchBackgroundColor: 'var(--element-base-1)',
      toggleButtonOffBackgroundColor: 'var(--element-ui-2)',
      toggleButtonOnBackgroundColor: 'var(--element-ui-0)',
      tooltipBackgroundColor: 'var(--element-base-1)',
      tabBackgroundColor: '#ffffff · 0%',
      tabBarBackgroundColor: 'var(--element-base-1)',
      tabHoverBackgroundColor: '#ffffff · 0%',
      valueChangeValueHighlightBackgroundColor: 'var(--element-base-1-selected)',
      valueChangeDeltaUpColor: 'var(--element-status-success)',
      valueChangeDeltaDownColor: 'var(--element-status-danger)',
      headerColumnResizeHandleColor: 'var(--element-action-secondary)',

      //chart colors
      chartMenuLabelColor: 'var(--element-text-primary)'
    } satisfies Partial<ThemeDefaultParams>
  });
