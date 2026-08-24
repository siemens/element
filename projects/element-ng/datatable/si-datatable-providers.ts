/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';
import { type NgxDatatableConfig, providedNgxDatatableConfig } from '@siemens/ngx-datatable';

/**
 * Configuration interface for \@siemens/ngx-datatable.
 *
 * @deprecated Import `NgxDatatableConfig` directly from `\@siemens/ngx-datatable` instead.
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
  summaryHeight: number;
}

export const SI_DATATABLE_CONFIG: SiDatatableConfig = {
  cssClasses: {
    sortAscending: 'icon element-sort-up text-accent',
    sortDescending: 'icon element-sort-down text-accent',
    pagerLeftArrow: 'icon element-left-2 flip-rtl',
    pagerRightArrow: 'icon element-right-2 flip-rtl',
    pagerPrevious: 'icon element-double-left flip-rtl',
    pagerNext: 'icon element-double-right flip-rtl',
    sortUnset: '',
    treeStatusLoading: '',
    treeStatusExpanded: 'icon element-down-2 flip-rtl',
    treeStatusCollapsed: 'icon element-right-2 flip-rtl'
  },
  headerHeight: 44, // 40px actual-height + 4px border-bottom
  footerHeight: 40,
  rowHeight: 64,
  rowHeightSmall: 48,
  rowHeightExtraSmall: 32,
  rowHeightTiny: 24,
  summaryHeight: 32
};

/**
 * Provides element configuration for the \@siemens/ngx-datatable.
 *
 *  @param configOverrides - overrides that will be merged with the element configuration.
 */
export const provideSiDatatableConfig = (configOverrides?: NgxDatatableConfig): Provider =>
  providedNgxDatatableConfig({ ...SI_DATATABLE_CONFIG, ...configOverrides });

/**
 * Configuration interface for \@siemens/ngx-datatable.
 *
 * @deprecated Import `NgxDatatableConfig` directly from `\@siemens/ngx-datatable` instead.
 */
export { NgxDatatableConfig };
