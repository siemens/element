/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { AppStateService } from './app-state.service';
import { CustomCatalogPageComponent } from './pages/custom-catalog/custom-catalog.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard.component';
import { FixedWidgetsDashboardPageComponent } from './pages/fixed-widgets-dashboard/fixed-widgets-dashboard.component';
import { RoutedDashboardPageComponent } from './pages/routed-dashboard/routed-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
    canDeactivate: [() => inject(AppStateService).canDeactivate()]
  },
  {
    path: 'custom-catalog',
    component: CustomCatalogPageComponent,
    canDeactivate: [() => inject(AppStateService).canDeactivate()]
  },
  {
    path: 'fixed-widgets',
    component: FixedWidgetsDashboardPageComponent,
    canDeactivate: [() => inject(AppStateService).canDeactivate()]
  },
  {
    path: 'routed-dashboard/:id',
    component: RoutedDashboardPageComponent,
    canDeactivate: [() => inject(AppStateService).canDeactivate()]
  }
];
