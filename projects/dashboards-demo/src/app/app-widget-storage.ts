/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  SiDefaultWidgetStorage,
  SiGridComponent,
  SiWidgetStorage,
  STORAGE_KEY,
  WidgetConfig
} from '@siemens/dashboards-ng';
import { delay, Observable } from 'rxjs';

import { FIXED_WIDGETS, WIDGETS } from './widgets/widget-configs.mocks';

const CUSTOM_DEFAULTS = 'app-default-widgets';
export class AppWidgetStorage extends SiDefaultWidgetStorage implements SiWidgetStorage {
  constructor() {
    super();
    if (this.storage.getItem(STORAGE_KEY) === null) {
      this.doRestoreDefaults();
    }
  }

  restoreDefaults = (dashboardId?: string): void => this.doRestoreDefaults(dashboardId);

  saveAsDefaults = (grid: SiGridComponent): void => {
    grid.transientWidgetInstances.forEach(
      widget => (widget.id = Math.random().toString(36).substring(2, 9))
    );
    this.storage.setItem(CUSTOM_DEFAULTS, JSON.stringify(grid.visibleWidgetInstances$.value));
  };

  private doRestoreDefaults(dashboardId?: string): void {
    const myDefaultsStr = this.storage.getItem(CUSTOM_DEFAULTS);
    let widgets: WidgetConfig[] | undefined;
    if (myDefaultsStr !== null) {
      widgets = JSON.parse(myDefaultsStr);
    }
    this.update(widgets ?? WIDGETS, dashboardId);

    const fixedWidgetsDashboard = FIXED_WIDGETS.map(widget => ({
      ...widget,
      isNotRemovable: true
    }));
    this.update(fixedWidgetsDashboard, 'fixed-widgets');
  }

  override save(
    modifiedWidgets: WidgetConfig[],
    addedWidgets: WidgetConfig[],
    removedWidgets?: WidgetConfig[],
    dashboardId?: string | undefined
  ): Observable<WidgetConfig[]> {
    const milliseconds = navigator.webdriver ? 0 : Math.random() * 4000;
    return super
      .save(modifiedWidgets, addedWidgets, removedWidgets, dashboardId)
      .pipe(delay(milliseconds));
  }

  override load(dashboardId?: string | undefined): Observable<WidgetConfig[]> {
    const milliseconds = navigator.webdriver ? 0 : Math.random() * 4000;
    return super.load(dashboardId).pipe(delay(milliseconds));
  }
}
