/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SiWidgetIdProvider, WidgetConfig } from '@siemens/dashboards-ng';

export class AppWidgetIdProvider extends SiWidgetIdProvider {
  override generateWidgetId(widget: Omit<WidgetConfig, 'id'>, dashboardId?: string): string {
    return crypto.randomUUID();
  }
}
