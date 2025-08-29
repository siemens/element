/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';
import { NgxDatatableConfig } from '@siemens/ngx-datatable';

export * from './si-datatable-interaction.directive';
export * from './si-datatable.module';

/**
 * @deprecated Use NgxDatatableConfig from \@siemens/ngx-datatable instead.
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
