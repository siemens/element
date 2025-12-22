/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { GridOptions, provideGlobalGridOptions } from 'ag-grid-community';

// import { AgDateInputComponent } from './components';
import { themeByDensity } from './index';

// TODO: To be decided on default options other than elementTheme
const ELEMENT_AG_GRID_OPTIONS: GridOptions = {
  tooltipShowDelay: 200,
  // components: {
  //   agDateInput: AgDateInputComponent
  // }
};

/**
 * Provides global AG Grid configuration with Element theme.
 *
 * @param density - Theme density variant: 'standard' (default, 42px rows), 'compact' (28px rows for data-dense layouts), or 'comfort' (84px rows for improved readability)
 * @param gridOptions - Optional additional grid options to merge with Element defaults
 * @returns Environment providers for AG Grid with Element theme
 *
 * @example
 * Basic usage with default standard density
 * ```typescript
 * import { provideElementTheme } from '@siemens/element-ng/ag-grid';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideElementTheme()
 *   ]
 * };
 * ```
 *
 * @example
 * Using compact density with custom options
 * ```typescript
 * import { provideElementTheme } from '@siemens/element-ng/ag-grid';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideElementTheme('compact', {
 *       tooltipShowDelay: 100,
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
