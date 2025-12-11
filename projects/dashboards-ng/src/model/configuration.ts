/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Provider } from '@angular/core';

import { DEFAULT_GRIDSTACK_OPTIONS, GridConfig } from './gridstack.model';
import { DashboardToolbarItem } from './si-dashboard-toolbar.model';

/**
 * Dashboard configuration object. Inject globally using the {@link SI_DASHBOARD_CONFIGURATION}
 * or configure individual dashboard instances.
 */
export type Config = {
  grid?: GridConfig;
};

/**
 * Injection token to configure dashboards. Use `{ provide: SI_DASHBOARD_CONFIGURATION, useValue: config }`
 * in your app configuration.
 */
export const SI_DASHBOARD_CONFIGURATION = new InjectionToken<Config>(
  'Injection token to configure dashboards.',
  {
    providedIn: 'root',
    factory: () => ({ grid: { gridStackOptions: DEFAULT_GRIDSTACK_OPTIONS } })
  }
);

/**
 * Injection token to configure global toolbar menu items.
 */
export const SI_DASHBOARD_TOOLBAR_ITEMS = new InjectionToken<{
  primary: DashboardToolbarItem[];
  secondary: DashboardToolbarItem[];
}>('Injection token to configure global toolbar menu items.');

/**
 * provider function to configure global toolbar menu items.
 * @param toolbarItems - primary and secondary edit actions which are common to all
 * dashboard instances on application.
 */
export const provideDashboardToolbarItems = (toolbarItems?: {
  primary?: DashboardToolbarItem[];
  secondary?: DashboardToolbarItem[];
}): Provider => ({
  provide: SI_DASHBOARD_TOOLBAR_ITEMS,
  useValue: { primary: toolbarItems?.primary ?? [], secondary: toolbarItems?.secondary ?? [] }
});
