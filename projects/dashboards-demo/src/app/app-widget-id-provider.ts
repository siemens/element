/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { SiWidgetIdProvider } from '@siemens/dashboards-ng';

export class AppWidgetIdProvider extends SiWidgetIdProvider {
  override widgetIdResolver(widgetId: string, dashboardId?: string): string {
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
}
