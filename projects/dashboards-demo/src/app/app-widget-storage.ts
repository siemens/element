/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  DashboardToolbarItem,
  SiDefaultWidgetStorage,
  SiGridComponent,
  SiWidgetStorage,
  STORAGE_KEY,
  WidgetConfig
} from '@siemens/dashboards-ng';
import { BehaviorSubject, delay, Observable, of } from 'rxjs';

import { FIXED_WIDGETS, WIDGETS } from './widgets/widget-configs.mocks';

const CUSTOM_DEFAULTS = 'app-default-widgets';
export class AppWidgetStorage extends SiDefaultWidgetStorage implements SiWidgetStorage {
  private secondaryMenuItems = new BehaviorSubject<DashboardToolbarItem[]>([]);
  private primaryMenuItems = new BehaviorSubject<DashboardToolbarItem[]>([
    {
      type: 'action',
      label: 'Custom Action',
      action: (grid: SiGridComponent) =>
        alert(`Grid has ${grid.visibleWidgetInstances$.value.length} widgets!`)
    }
  ]);

  constructor() {
    super();
    if (this.storage.getItem(STORAGE_KEY) === null) {
      this.doRestoreDefaults();
    }

    this.secondaryMenuItems.next([
      {
        type: 'action',
        label: 'TOOLBAR.RESTORE_DEFAULTS',
        action: (grid: SiGridComponent) => this.restoreDefaults(grid)
      },
      {
        type: 'action',
        label: 'TOOLBAR.SAVE_AS_DEFAULTS',
        action: (grid: SiGridComponent) => this.saveAsDefaults(grid)
      }
    ]);
  }

  restoreDefaults = (grid: SiGridComponent): Observable<void> => this.doRestoreDefaults();

  saveAsDefaults = (grid: SiGridComponent): Observable<void> => {
    grid.transientWidgetInstances.forEach(
      widget => (widget.id = Math.random().toString(36).substring(2, 9))
    );
    this.storage.setItem(CUSTOM_DEFAULTS, JSON.stringify(grid.visibleWidgetInstances$.value));
    return of();
  };

  override getToolbarMenuItems = (
    dashboardId?: string
  ): {
    primary: Observable<DashboardToolbarItem[]>;
    secondary: Observable<DashboardToolbarItem[]>;
  } => {
    if (dashboardId === 'custom-library') {
      return { primary: this.primaryMenuItems, secondary: this.secondaryMenuItems };
    } else if (dashboardId === '1') {
      return {
        primary: of([
          {
            type: 'action',
            label: 'Dashboard 1',
            action: (grid: SiGridComponent) =>
              alert('This message is only for the Demo Dashboard 1')
          }
        ]),
        secondary: of([
          {
            type: 'action',
            label: 'Secondary Action',
            action: (grid: SiGridComponent) => alert('Action located in the secondary menu items!')
          }
        ])
      };
    } else if (dashboardId === '2') {
      return {
        primary: of([
          {
            type: 'action',
            label: 'Dashboard 2',
            action: (grid: SiGridComponent) =>
              alert('This message is only for the Demo Dashboard 1')
          }
        ]),
        secondary: this.secondaryMenuItems
      };
    } else {
      return { primary: of([]), secondary: of([]) };
    }
  };

  private doRestoreDefaults(): Observable<void> {
    const myDefaultsStr = this.storage.getItem(CUSTOM_DEFAULTS);
    let widgets: WidgetConfig[] | undefined;
    if (myDefaultsStr !== null) {
      widgets = JSON.parse(myDefaultsStr);
    }
    this.update(widgets ?? WIDGETS);

    const fixedWidgetsDashboard = FIXED_WIDGETS.map(widget => ({
      ...widget,
      isNotRemovable: true
    }));
    this.update(fixedWidgetsDashboard, 'fixed-widgets');

    return of();
  }

  override save(
    widgets: (WidgetConfig | Omit<WidgetConfig, 'id'>)[],
    removedWidgets?: WidgetConfig[] | undefined,
    dashboardId?: string | undefined
  ): Observable<WidgetConfig[]> {
    const milliseconds = navigator.webdriver ? 0 : Math.random() * 4000;
    return super.save(widgets, removedWidgets, dashboardId).pipe(delay(milliseconds));
  }

  override load(dashboardId?: string | undefined): Observable<WidgetConfig[]> {
    const milliseconds = navigator.webdriver ? 0 : Math.random() * 4000;
    return super.load(dashboardId).pipe(delay(milliseconds));
  }
}
