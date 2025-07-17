/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SiFlexibleDashboardComponent, Widget } from '@siemens/dashboards-ng';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';

import { environment } from '../../../environments/environment';
import { AppStateService } from '../../app-state.service';
import { DashboardFiltersComponent } from '../../components/dashboard-filters/dashboard-filters.component';
import {
  BAR_CHART_DESC,
  CIRCLE_CHART_DESC,
  GAUGE_CHART_DESC,
  LINE_CHART_DESC
} from '../../widgets/charts/widget-descriptors';
import { HELLO_DESCRIPTOR } from '../../widgets/hello-widget/widget-descriptors';

@Component({
  selector: 'app-routed-dashboard',
  imports: [SiFlexibleDashboardComponent, DashboardFiltersComponent, SiEmptyStateComponent],
  templateUrl: './routed-dashboard.component.html',
  styleUrl: './routed-dashboard.component.scss'
})
export class RoutedDashboardPageComponent implements OnInit {
  widgetCatalog: Widget[] = [
    HELLO_DESCRIPTOR,
    LINE_CHART_DESC,
    BAR_CHART_DESC,
    CIRCLE_CHART_DESC,
    GAUGE_CHART_DESC,
    {
      id: 'note-widget-web-component',
      name: 'Note (web-component)',
      componentFactory: {
        factoryType: 'web-component',
        url: `${environment.webComponentsBaseUrl}/webcomponent-widgets.js`,
        componentName: 'note-widget',
        editorComponentName: 'note-widget-editor'
      },
      defaults: {
        width: 6,
        height: 2
      },
      payload: {
        message: 'You private notes.'
      }
    }
  ];

  protected dashboardId?: string;

  appStateService = inject(AppStateService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.dashboardId = params.get('id') ?? undefined;
    });
  }
}
