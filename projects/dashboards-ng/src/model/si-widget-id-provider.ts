/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable, InjectionToken } from '@angular/core';

import type { WidgetConfig } from './widgets.model';

/**
 * Injection token to optionally inject the {@link SiWidgetIdProvider} implementation
 * to provide custom widget id generation logic. The default implementation
 * is {@link SiWidgetDefaultIdProvider}.
 *
 * * @example
 * The following shows how to provide your own widget id provider.
 * ```
 * providers: [..., { provide: SI_WIDGET_ID_PROVIDER, useClass: CustomWidgetIdProvider }]
 * ```
 *
 */
export const SI_WIDGET_ID_PROVIDER = new InjectionToken<SiWidgetIdProvider>(
  'Injection token to configure your widget id provider.',
  { providedIn: 'root', factory: () => inject(SiWidgetDefaultIdProvider) }
);

/**
 * Abstract class to provide widget id generation logic.
 */
export abstract class SiWidgetIdProvider {
  /**
   * Resolves a new widget id.
   * @param widgetId - {@link WidgetConfig.widgetId}
   * @param dashboardId - The id of the dashboard where the widget is added.
   * @returns The resolved widget id as a string or a Promise that resolves to a string.
   */
  abstract widgetIdResolver(
    widgetId: WidgetConfig['widgetId'],
    dashboardId?: string
  ): string | Promise<string>;
}

/**
 * The default implementation of the {@link SiWidgetIdProvider} which
 * generates random widget ids.
 */
@Injectable({ providedIn: 'root' })
export class SiWidgetDefaultIdProvider extends SiWidgetIdProvider {
  /**
   * @returns A randomly generated widget id string.
   */
  widgetIdResolver(widgetId: string, dashboardId?: string): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
