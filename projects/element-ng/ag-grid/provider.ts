/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { elementTheme } from '@siemens/element-ng/ag-grid';
import { GridOptions, provideGlobalGridOptions } from 'ag-grid-community';

import { AgDateInputComponent } from './ag-date-input.component';

// TODO: To be decided on default options other than elementTheme
const ELEMENT_AG_GRID_OPTIONS: GridOptions = {
  theme: elementTheme,
  tooltipShowDelay: 200,
  components: {
    agDateInput: AgDateInputComponent
  }
};

/**
 * Provides global AG Grid configuration with Element theme.
 *
 * @param gridOptions - Optional additional grid options to merge with Element defaults
 * @returns Environment providers for AG Grid with Element theme
 *
 * @example
 * ```typescript
 * import { provideElementTheme } from '@siemens/element-ng/ag-grid';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideElementTheme({
 *       rowHeight: 50,
 *       // ... custom options
 *     })
 *   ]
 * };
 * ```
 */
export const provideElementTheme = (gridOptions?: GridOptions): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: 'ag-grid-options',
      useValue: provideGlobalGridOptions({ ...ELEMENT_AG_GRID_OPTIONS, ...gridOptions })
    }
  ]);
};
