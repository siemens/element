/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { SiWidgetIdProvider, WidgetConfig } from '@siemens/dashboards-ng';

export class AppWidgetIdProvider extends SiWidgetIdProvider {
  override widgetIdResolver(widget: WidgetConfig, dashboardId?: string): string {
    return (dashboardId ?? '') + Math.random().toString(36).substring(2, 9);

    /* Or return a Promise<string> for async id generation
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        const newId = (dashboardId ?? '') + Math.random().toString(36).substring(2, 9);
        resolve(newId);
      }, 10);
    });
    */
  }

  override transientWidgetIdResolver(
    widget: Omit<WidgetConfig, 'id'>,
    dashboardId?: string
  ): string {
    return super.transientWidgetIdResolver(widget, dashboardId);
    // or your own implementation to generate transient ids
  }
}
