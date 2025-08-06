/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { Config, SiFlexibleDashboardComponent, Widget } from '@spike-rabbit/dashboards-ng';

import { AppStateService } from '../../app-state.service';
import { DashboardFiltersComponent } from '../../components/dashboard-filters/dashboard-filters.component';
import {
  BAR_CHART_DESC,
  CIRCLE_CHART_DESC,
  GAUGE_CHART_DESC,
  LINE_CHART_DESC
} from '../../widgets/charts/widget-descriptors';

@Component({
  selector: 'app-fixed-widgets-dashboard',
  imports: [SiFlexibleDashboardComponent, DashboardFiltersComponent],
  template: `
    <si-flexible-dashboard
      heading="Fixed number of widgets (no adding, no removing)"
      dashboardId="fixed-widgets"
      [hideAddWidgetInstanceButton]="true"
      [config]="config"
      [widgetCatalog]="widgetCatalog"
      (isModified)="appStateService.editable$.next($event)"
    >
      <app-dashboard-filters menubar filters-slot />
    </si-flexible-dashboard>
  `,
  styleUrl: './fixed-widgets-dashboard.component.scss'
})
export class FixedWidgetsDashboardPageComponent {
  appStateService = inject(AppStateService);
  widgetCatalog: Widget[] = [LINE_CHART_DESC, BAR_CHART_DESC, CIRCLE_CHART_DESC, GAUGE_CHART_DESC];
  config: Config = {
    grid: {
      gridStackOptions: {
        column: 8
      }
    }
  };
}
