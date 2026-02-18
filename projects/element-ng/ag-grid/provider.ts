/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { GridOptions, provideGlobalGridOptions, Theme } from 'ag-grid-community';

import { AgDateInputComponent, AgNoRowsOverlayComponent } from './components';
import { elementTheme, elementThemeCompact, elementThemeComfort } from './themes';

/**
 * Default AG Grid options for Element theme.
 * Includes custom components for date input and empty state overlay.
 * @internal
 */
const ELEMENT_AG_GRID_OPTIONS: GridOptions = {
  tooltipShowDelay: 200,
  components: {
    agDateInput: AgDateInputComponent,
    agNoRowsOverlay: AgNoRowsOverlayComponent
  }
};

/**
 * Theme mapping by density variant.
 * @internal
 */
const THEME_BY_DENSITY = new Map<string, Theme>([
  ['compact', elementThemeCompact],
  ['comfort', elementThemeComfort],
  ['standard', elementTheme]
]);

/**
 * Provides AG Grid global configuration with Element design system theme.
 *
 * This provider configures AG Grid with the Element theme, custom components,
 * and density-specific styling. Use it in your application providers.
 *
 * @param density - The density variant to use. Options:
 *   - 'compact': Minimal spacing (28px row height, 32px header height, 4px spacing)
 *   - 'standard': Default spacing (42px row height, 48px header height, 8px spacing)
 *   - 'comfort': Generous spacing (84px row height, 96px header height, 12px spacing)
 * @param gridOptions - Optional AG Grid options to merge with Element defaults.
 *   These options will override Element defaults if specified.
 * @returns Environment providers for dependency injection
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideSiAgGridConfig()
 *   ]
 * };
 *
 * // With custom options
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideSiAgGridConfig('compact', {
 *       rowHeight: 30,
 *       suppressMenuHide: true
 *     })
 *   ]
 * };
 * ```
 */
export const provideSiAgGridConfig = (
  density: 'compact' | 'comfort' | 'standard' = 'standard',
  gridOptions?: GridOptions
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: 'ag-grid-options',
      useValue: provideGlobalGridOptions({
        ...ELEMENT_AG_GRID_OPTIONS,
        ...gridOptions,
        theme: THEME_BY_DENSITY.get(density)
      })
    }
  ]);
};
