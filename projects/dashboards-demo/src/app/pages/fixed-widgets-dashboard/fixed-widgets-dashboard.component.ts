/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Config, SiFlexibleDashboardComponent, Widget } from '@siemens/dashboards-ng';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { Link } from '@siemens/element-ng/link';
import { filter, pairwise, take } from 'rxjs';

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
  imports: [SiFlexibleDashboardComponent, DashboardFiltersComponent, SiInlineNotificationComponent],
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
      @if (showStaleDataNotification()) {
        <si-inline-notification
          dashboard-notification
          severity="warning"
          heading="Some data is outdated"
          message="The dashboard could not refresh all widgets."
          [action]="retryAction"
        />
      }
    </si-flexible-dashboard>
  `,
  styleUrl: './fixed-widgets-dashboard.component.scss'
})
export class FixedWidgetsDashboardPageComponent implements AfterViewInit {
  appStateService = inject(AppStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboard = viewChild.required(SiFlexibleDashboardComponent);

  protected readonly showStaleDataNotification = signal(false);
  protected readonly retryAction: Link = {
    title: 'Retry',
    action: () => this.showStaleDataNotification.set(false)
  };
  widgetCatalog: Widget[] = [LINE_CHART_DESC, BAR_CHART_DESC, CIRCLE_CHART_DESC, GAUGE_CHART_DESC];
  config: Config = {
    grid: {
      gridStackOptions: {
        column: 8
      }
    }
  };

  ngAfterViewInit(): void {
    this.dashboard()
      .grid()
      .isLoading.pipe(
        pairwise(),
        filter(([wasLoading, isLoading]) => wasLoading && !isLoading),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.showStaleDataNotification.set(true));
  }
}
