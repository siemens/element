/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, InjectionToken } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { DashboardToolbarItem } from './si-dashboard-toolbar.model';
import { WidgetConfig } from './widgets.model';

/**
 * Injection token to configure your widget store implementation. Use
 * `{ provide: SI_WIDGET_STORE, useClass: AppWidgetStorage }` in your app configuration.
 */
export const SI_WIDGET_STORE = new InjectionToken<SiWidgetStorage>(
  'Injection token to configure your widget store implementation.',
  { providedIn: 'root', factory: () => new SiDefaultWidgetStorage() }
);

/**
 * Widget storage api to provide the persistence layer of the widgets of a dashboard
 * (typically from a web service). The dashboard grid uses this API to load and save
 * the widget configurations. Applications using siemens-dashboard needs to implement
 * this abstract class and provide it in the module configuration.
 */
export abstract class SiWidgetStorage {
  /**
   * Returns an observable with the dashboard widget configuration. The dashboard subscribes to the
   * observable and updates when a new value emits.
   */
  abstract load(dashboardId?: string): Observable<WidgetConfig[]>;

  /**
   * Saves the given widget configuration. Existing widgets have a `id`. New widgets have no `id`
   * and it is in the responsibility of the implementor to set the ids of the new widgets. In addition,
   * the implementor needs to check if objects that have been available before are missing. These
   * widgets have been removed by the user. As a result of this method, the observables returned
   * by the `load()` method should emit the new widget config objects, before also returning them.
   * @param widgets - The existing and new widget config objects to be saved.
   */
  abstract save(
    widgets: (WidgetConfig | Omit<WidgetConfig, 'id'>)[],
    removedWidgets?: WidgetConfig[],
    dashboardId?: string
  ): Observable<WidgetConfig[]>;

  /**
   * Optional method to provide primary and secondary toolbar menu items.
   * @param dashboardId - The id of the dashboard if present to allow dashboard specific menu items.
   */
  getToolbarMenuItems?: (dashboardId?: string) => {
    primary: Observable<(MenuItem | DashboardToolbarItem)[]>;
    secondary: Observable<(MenuItem | DashboardToolbarItem)[]>;
  };
}

/**
 * The {@link SiDefaultWidgetStorage} uses this key to persist the dashboard
 * configurations in the session of local storage.
 */
export const STORAGE_KEY = 'dashboard-store';

/**
 * Injection token to optionally inject the {@link Storage} implementation
 * that will be used by the {@link SiDefaultWidgetStorage}. The default implementation
 * is {@link sessionStorage}.
 *
 * @example
 * The following shows how to provide the localStorage.
 * ```
 * providers: [..., { provide: DEFAULT_WIDGET_STORAGE_TOKEN, useValue: localStorage }]
 * ```
 *
 */
export const DEFAULT_WIDGET_STORAGE_TOKEN = new InjectionToken<Storage>(
  'default storage for dashboard store'
);

/**
 * Default implementation of {@link SiWidgetStorage} that uses the
 * {@link Storage} implementation provided by the {@link DEFAULT_WIDGET_STORAGE_TOKEN}.
 * In general, it persists the dashboard's configurations in the Browser's session or local
 * storage. *
 */
export class SiDefaultWidgetStorage extends SiWidgetStorage {
  storage: Storage;

  private map = new Map<string, BehaviorSubject<WidgetConfig[]>>();
  private widgets?: BehaviorSubject<WidgetConfig[]>;

  constructor() {
    super();
    this.storage = inject(DEFAULT_WIDGET_STORAGE_TOKEN, { optional: true }) ?? sessionStorage;
  }

  load(dashboardId?: string): Observable<WidgetConfig[]> {
    if (!dashboardId) {
      this.widgets ??= new BehaviorSubject<WidgetConfig[]>(this.loadFromStorage());
      return this.widgets;
    } else if (!this.map.has(dashboardId)) {
      this.map.set(
        dashboardId,
        new BehaviorSubject<WidgetConfig[]>(this.loadFromStorage(dashboardId))
      );
    }
    return this.map.get(dashboardId)!;
  }

  save(
    widgets: (WidgetConfig | Omit<WidgetConfig, 'id'>)[],
    removedWidgets?: WidgetConfig[],
    dashboardId?: string
  ): Observable<WidgetConfig[]> {
    const newWidgets = widgets.map(widget => {
      if ((widget as WidgetConfig).id === undefined) {
        return { ...widget, id: Math.random().toString(36).substring(2, 9) };
      } else {
        return widget as WidgetConfig;
      }
    });
    this.update(newWidgets, dashboardId);
    return of(newWidgets);
  }

  protected update(newConfigs: WidgetConfig[], dashboardId?: string): void {
    const widgets$ = this.load(dashboardId) as BehaviorSubject<WidgetConfig[]>;
    widgets$.next(newConfigs);
    if (!dashboardId) {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
    } else {
      this.storage.setItem(`${STORAGE_KEY}-${dashboardId}`, JSON.stringify(newConfigs));
    }
  }

  protected loadFromStorage(dashboardId?: string): WidgetConfig[] {
    let configStr;
    if (!dashboardId) {
      configStr = this.storage.getItem(STORAGE_KEY);
    } else {
      configStr = this.storage.getItem(`${STORAGE_KEY}-${dashboardId}`);
    }

    let widgetConfigs: WidgetConfig[] = [];
    if (configStr) {
      widgetConfigs = JSON.parse(configStr);
    }
    return widgetConfigs;
  }
}
