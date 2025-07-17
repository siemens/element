/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

import { DEFAULT_GRIDSTACK_OPTIONS, GridConfig } from './gridstack.model';

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
 * @deprecated Use SI_DASHBOARD_CONFIGURATION instead.
 */
export const CONFIG_TOKEN = SI_DASHBOARD_CONFIGURATION;
