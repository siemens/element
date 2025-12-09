/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';

// Copy of NgxDatatableConfig from @siemens/ngx-datatable to maintain compatibility
// with v22 and earlier where `NgxDatatableConfig` is not defined.
// See https://github.com/siemens/ngx-datatable/blob/main/projects/ngx-datatable/src/lib/ngx-datatable.config.ts#L50.
/** Interface for messages to override default table texts. */
interface NgxDatatableMessages {
  /** Message to show when the array is present but empty */
  emptyMessage: string;
  /** Footer total message */
  totalMessage: string;
  /** Footer selected message */
  selectedMessage: string;
  /** Pager screen reader message for the first page button */
  ariaFirstPageMessage: string;
  /**
   * Pager screen reader message for the n-th page button.
   * It will be rendered as: `{{ariaPageNMessage}} {{n}}`.
   */
  ariaPageNMessage: string;
  /** Pager screen reader message for the previous page button */
  ariaPreviousPageMessage: string;
  /** Pager screen reader message for the next page button */
  ariaNextPageMessage: string;
  /** Pager screen reader message for the last page button */
  ariaLastPageMessage: string;
  /** Row checkbox aria label */
  ariaRowCheckboxMessage: string;
  /** Header checkbox aria label */
  ariaHeaderCheckboxMessage: string;
  /** Group header checkbox aria label */
  ariaGroupHeaderCheckboxMessage: string;
}
/** CSS classes for icons that override the default table icons. */
interface NgxDatatableCssClasses {
  sortAscending: string;
  sortDescending: string;
  sortUnset: string;
  pagerLeftArrow: string;
  pagerRightArrow: string;
  pagerPrevious: string;
  pagerNext: string;
  treeStatusLoading: string;
  treeStatusExpanded: string;
  treeStatusCollapsed: string;
}
/**
 * Interface definition for ngx-datatable global configuration
 */
export interface NgxDatatableConfig {
  messages?: NgxDatatableMessages;
  cssClasses?: NgxDatatableCssClasses;
  headerHeight?: number;
  footerHeight?: number;
  rowHeight?: number;
  defaultColumnWidth?: number;
}

/**
 * @deprecated Use NgxDatatableConfig from \@siemens/ngx-datatable instead from v23 onward.
 *
 * Configuration interface for the upstream \@siemens/ngx-datatable project.
 * See https://github.com/siemens/ngx-datatable/blob/main/projects/ngx-datatable/src/lib/ngx-datatable.config.ts#L50.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface INgxDatatableConfig extends NgxDatatableConfig {}

/**
 * Extends the original NgxDatatableConfig with additional properties and makes all fields required to maintain compatibility.
 */
interface SiDatatableConfig extends NgxDatatableConfig {
  cssClasses: Exclude<NgxDatatableConfig['cssClasses'], undefined>;
  headerHeight: number;
  footerHeight: number;
  rowHeight: number;
  rowHeightSmall: number;
  rowHeightExtraSmall: number;
  rowHeightTiny: number;
}

export const SI_DATATABLE_CONFIG: SiDatatableConfig = {
  cssClasses: {
    sortAscending: 'icon element-sort-up text-primary',
    sortDescending: 'icon element-sort-down text-primary',
    pagerLeftArrow: 'icon element-left-2 flip-rtl',
    pagerRightArrow: 'icon element-right-2 flip-rtl',
    pagerPrevious: 'icon element-double-left flip-rtl',
    pagerNext: 'icon element-double-right flip-rtl',
    sortUnset: '',
    treeStatusLoading: '',
    treeStatusExpanded: 'icon element-down-2 flip-rtl',
    treeStatusCollapsed: 'icon element-right-2 flip-rtl'
  },
  headerHeight: 40,
  footerHeight: 40,
  rowHeight: 64,
  rowHeightSmall: 48,
  rowHeightExtraSmall: 32,
  rowHeightTiny: 24
};

/**
 * Provides element configuration for the \@siemens/ngx-datatable.
 *
 *  @param configOverrides - overrides that will be merged with the element configuration.
 */
export const provideSiDatatableConfig = (configOverrides?: NgxDatatableConfig): Provider => ({
  provide: 'configuration',
  useValue: { ...SI_DATATABLE_CONFIG, ...configOverrides }
});
