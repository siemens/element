/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { BehaviorSubject } from 'rxjs';

import { DashboardToolbarItem } from '../../model/si-dashboard-toolbar.model';
import type { SiGridComponent } from '../grid/si-grid.component';
import type { SiDashboardToolbarComponent } from './si-dashboard-toolbar.component';

export interface DashboardToolbarContext {
  readonly dashboardId: Signal<string | undefined>;
  readonly grid: Signal<SiGridComponent>;
  readonly editable: Signal<boolean>;
  readonly modified: Signal<boolean>;
  readonly isDashboardVisible: Signal<boolean>;
  readonly toolbar: Signal<SiDashboardToolbarComponent | undefined>;
  readonly primaryEditActions$: BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>;
  readonly secondaryEditActions$: BehaviorSubject<(MenuItem | DashboardToolbarItem)[]>;
  edit(): void;
  cancel(): void;
  save(): void;
  addWidget(): void;
}

export const SI_DASHBOARD_TOOLBAR_CONTEXT = new InjectionToken<DashboardToolbarContext>(
  'si-flexible-dashboard toolbar context'
);
