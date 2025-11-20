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
   * Generates a transient widget id for newly added widgets in edit mode.
   *
   * @param widget - The widget instance config without any id.
   * @param dashboardId - The id of the dashboard where the widget is added.
   * @returns A transient widget id as a string.
   */
  abstract generateWidgetId(widget: Omit<WidgetConfig, 'id'>, dashboardId?: string): string;
}

/**
 * The default implementation of the {@link SiWidgetIdProvider} which
 * generates random widget ids.
 */
@Injectable({ providedIn: 'root' })
export class SiWidgetDefaultIdProvider extends SiWidgetIdProvider {
  /**
   * Generates a unique widget id.
   *
   * The method uses `crypto.randomUUID()` which generates a RFC4122 version 4 UUID
   * (a cryptographically secure random identifier with 122 bits of entropy).
   *
   * @param widget - The widget instance config without any id.
   * @param dashboardId - The id of the dashboard where the widget is added.
   * @returns A unique widget id string in the format `crypto.randomUUID()`.
   */
  override generateWidgetId(widget: Omit<WidgetConfig, 'id'>, dashboardId?: string): string {
    return crypto.randomUUID();
  }
}
