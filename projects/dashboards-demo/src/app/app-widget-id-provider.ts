/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SiWidgetIdProvider, WidgetConfig } from '@siemens/dashboards-ng';

export class AppWidgetIdProvider extends SiWidgetIdProvider {
  override generateWidgetId(widget: Omit<WidgetConfig, 'id'>, dashboardId?: string): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback for non-secure browser contexts where crypto.randomUUID is unavailable
    // It's necessary to run tests locally
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // UUID version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // UUID variant
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}
