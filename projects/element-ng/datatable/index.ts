/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';

export * from './si-datatable-interaction.directive';
export * from './si-datatable.module';

/*
 * Configuration interface for the upstream @siemens/ngx-datatable project.
 * See https://github.com/siemens/ngx-datatable/blob/main/projects/ngx-datatable/src/lib/ngx-datatable.config.ts#L50.
 */
export interface INgxDatatableConfig {
  messages?: {
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
  };
  cssClasses?: {
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
  };
  headerHeight?: number;
  footerHeight?: number;
  rowHeight?: number;
  defaultColumnWidth?: number;
}

/*
 * Extends the original INgxDatatableConfig with additional properties and makes all fields required to maintain compatibility.
 */
interface SiDatatableConfig extends INgxDatatableConfig {
  cssClasses: Exclude<INgxDatatableConfig['cssClasses'], undefined>;
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
export const provideSiDatatableConfig = (configOverrides?: INgxDatatableConfig): Provider => ({
  provide: 'configuration',
  useValue: { ...SI_DATATABLE_CONFIG, ...configOverrides }
});
