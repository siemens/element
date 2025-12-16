/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { elementTheme } from '@siemens/element-ng/ag-grid';
import { GridOptions, provideGlobalGridOptions } from 'ag-grid-community';

// TODO: To be decided on default options other than elementTheme
const ELEMENT_AG_GRID_OPTIONS: GridOptions = {
  theme: elementTheme,
  tooltipShowDelay: 200
};

export const provideElementTheme = (gridOptions?: GridOptions): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: 'ag-grid-options',
      useValue: provideGlobalGridOptions({ ...ELEMENT_AG_GRID_OPTIONS, ...gridOptions })
    }
  ]);
};
