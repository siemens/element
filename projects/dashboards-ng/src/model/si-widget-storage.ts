/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inject, InjectionToken } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { BehaviorSubject, Observable, of } from 'rxjs';

import type { SiFlexibleDashboardComponent } from '../components/flexible-dashboard/si-flexible-dashboard.component';
import type { provideDashboardToolbarItems } from './configuration';
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
   * Saves the given widget configuration. New widgets have `id`
   * generated through the `SiWidgetIdProvider.generateWidgetId` implementation
   * and if ids comes from backend then it is in the responsibility of the implementor to update
   * the ids of the new widgets with the ids returned from backend upon save. In addition,
   * the implementor needs to check if objects that have been available before are missing. These
   * widgets have been removed by the user. As a result of this method, the observables returned
   * by the `load()` method should emit the new widget config objects, before also returning them.
   * @param modifiedWidgets - The existing widget config objects to be saved.
   * @param addedWidgets - The new widget config objects to be saved.
   * @param removedWidgets - The widget config objects that have been removed.
   * @param dashboardId - The id of the dashboard if present to allow dashboard specific storage.
   * @returns An observable that emits the saved widget config objects with their ids.
   */

  abstract save(
    modifiedWidgets: WidgetConfig[],
    addedWidgets: WidgetConfig[],
    removedWidgets?: WidgetConfig[],
    dashboardId?: string
  ): Observable<WidgetConfig[]>;

  /**
   * Optional method to provide primary and secondary toolbar menu items.
   * @param dashboardId - The id of the dashboard if present to allow dashboard specific menu items.
   *
   * @deprecated use {@link provideDashboardToolbarItems} to provide common toolbar items.
   * Additionally configure individual dashboard actions via {@link SiFlexibleDashboardComponent.primaryEditActions} and {@link SiFlexibleDashboardComponent.secondaryEditActions} respectively.
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
    modifiedWidgets: WidgetConfig[],
    addedWidgets: WidgetConfig[],
    removedWidgets?: WidgetConfig[],
    dashboardId?: string
  ): Observable<WidgetConfig[]> {
    const newWidgets = [...addedWidgets, ...modifiedWidgets];
    this.update(newWidgets, dashboardId);
    return of(newWidgets);
  }

  protected update(widgetConfigs: WidgetConfig[], dashboardId?: string): void {
    const widgets$ = this.load(dashboardId) as BehaviorSubject<WidgetConfig[]>;
    widgets$.next(widgetConfigs);
    if (!dashboardId) {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(widgetConfigs));
    } else {
      this.storage.setItem(`${STORAGE_KEY}-${dashboardId}`, JSON.stringify(widgetConfigs));
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
