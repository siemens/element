/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { themeByDensity } from '@siemens/element-ng/ag-grid';
import { GridOptions, provideGlobalGridOptions } from 'ag-grid-community';

import { AgDateInputComponent } from './components';

// TODO: To be decided on default options other than elementTheme
const ELEMENT_AG_GRID_OPTIONS: GridOptions = {
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
export const provideElementTheme = (
  density: 'compact' | 'comfort' | 'standard' = 'standard',
  gridOptions?: GridOptions
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: 'ag-grid-options',
      useValue: provideGlobalGridOptions({
        ...ELEMENT_AG_GRID_OPTIONS,
        ...gridOptions,
        theme: themeByDensity.get(density)
      })
    }
  ]);
};
