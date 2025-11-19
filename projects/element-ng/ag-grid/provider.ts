/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { elementTheme } from '@siemens/element-ng/ag-grid';
import {
  ClientSideRowModelModule,
  GridOptions,
  InfiniteRowModelModule,
  Module,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  provideGlobalGridOptions,
  RowDragModule,
  RowSelectionModule,
  TextFilterModule,
  TooltipModule,
  ValidationModule
} from 'ag-grid-community';

// TODO: To be decided on default options other than elementTheme
const ELEMENT_AG_GRID_OPTIONS: GridOptions = {
  theme: elementTheme,
  headerHeight: 40,
  rowHeight: 48
};

// TODO: To be decided on which modules to include by default
const ELEMENT_AG_GRID_DEFAULT_MODULES: Module[] = [
  RowDragModule,
  InfiniteRowModelModule,
  NumberFilterModule,
  TextFilterModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  TooltipModule,
  PaginationModule,
  ValidationModule
];

export const provideElementAgGridConfig = (
  modules?: Module[],
  gridOptions?: GridOptions
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: 'ag-grid-modules',
      useValue: ModuleRegistry.registerModules([
        ...ELEMENT_AG_GRID_DEFAULT_MODULES,
        ...(modules ?? [])
      ])
    },
    {
      provide: 'ag-grid-options',
      useValue: provideGlobalGridOptions({ ...ELEMENT_AG_GRID_OPTIONS, ...gridOptions })
    }
  ]);
};
