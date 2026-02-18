/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  DashboardToolbarItem,
  SI_WIDGET_STORE,
  SiFlexibleDashboardComponent,
  Widget
} from '@siemens/dashboards-ng';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';

import { environment } from '../../../environments/environment';
import { AppStateService } from '../../app-state.service';
import { AppWidgetStorage } from '../../app-widget-storage';
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
  styleUrl: './routed-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  protected readonly primaryActions = signal<DashboardToolbarItem[]>([]);
  protected readonly secondaryActions = signal<DashboardToolbarItem[]>([]);
  private widgetStore = inject<AppWidgetStorage>(SI_WIDGET_STORE);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.dashboardId = params.get('id') ?? undefined;

      this.primaryActions.set([
        {
          type: 'action',
          label: `Dashboard ${this.dashboardId}`,
          action: grid => alert(`This message is only for the Demo Dashboard ${this.dashboardId}`)
        }
      ]);
      if (this.dashboardId === '1') {
        this.secondaryActions.set([
          {
            type: 'action',
            label: 'Secondary Action',
            action: grid => alert('Action located in the secondary menu items!')
          }
        ]);
      } else {
        this.secondaryActions.set([
          {
            type: 'action',
            label: 'TOOLBAR.RESTORE_DEFAULTS',
            action: () => this.widgetStore.restoreDefaults(this.dashboardId)
          },
          {
            type: 'action',
            label: 'TOOLBAR.SAVE_AS_DEFAULTS',
            action: grid => this.widgetStore.saveAsDefaults(grid)
          }
        ]);
      }
    });
  }
}
