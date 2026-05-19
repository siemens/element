/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SI_WIDGET_STORE, SiFlexibleDashboardComponent, Widget, WidgetConfig } from '@siemens/dashboards-ng';
import { SiDashboardCardComponent, SiDashboardComponent } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { environment } from 'projects/dashboards-demo/src/environments/environment';

import { AppStateService } from '../../app-state.service';
import { CarouselComponent, CarouselItemDirective } from '../../components/carousel/carousel.component';
import { DashboardFiltersComponent } from '../../components/dashboard-filters/dashboard-filters.component';
import {
  BAR_CHART_DESC,
  CIRCLE_CHART_DESC,
  GAUGE_CHART_DESC,
  LINE_CHART_DESC,
  LIST_WIDGET,
  TIMELINE_WIDGET,
  VALUE_WIDGET
} from '../../widgets/charts/widget-descriptors';
import { WIZARD_WIDGET_DESCRIPTOR } from '../../widgets/contact-widget/contact-descriptors';
import { HELLO_DESCRIPTOR } from '../../widgets/hello-widget/widget-descriptors';
import { DOWNLOAD_WIDGET, UPLOAD_WIDGET } from '../../widgets/module-federation-widgets';
import { WidgetRendererComponent } from './widget-renderer.directive';

@Component({
  selector: 'app-dashboard',
  imports: [NgTemplateOutlet, SiFlexibleDashboardComponent, SiDashboardComponent, SiDashboardCardComponent, DashboardFiltersComponent, SiEmptyStateComponent, WidgetRendererComponent, SiLoadingSpinnerComponent, CarouselComponent, CarouselItemDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  appStateService = inject(AppStateService);
  private readonly widgetStorage = inject(SI_WIDGET_STORE);
  readonly widgets = toSignal(this.widgetStorage.load(), { initialValue: [] as WidgetConfig[] });
  readonly widgetCatalogMap = computed(() => new Map(this.widgetCatalog.map(w => [w.id, w])));

  protected readonly columns = signal(1);
  protected readonly rows = signal(1);
  widgetCatalog: Widget[] = [
    HELLO_DESCRIPTOR,
    WIZARD_WIDGET_DESCRIPTOR,
    LINE_CHART_DESC,
    BAR_CHART_DESC,
    CIRCLE_CHART_DESC,
    GAUGE_CHART_DESC,
    LIST_WIDGET,
    TIMELINE_WIDGET,
    VALUE_WIDGET,
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
    },
    {
      id: 'contact-widget-web-component',
      name: 'Contact (web-component)',
      componentFactory: {
        factoryType: 'web-component',
        url: `${environment.webComponentsBaseUrl}/webcomponent-widgets.js`,
        componentName: 'contact-widget',
        editorComponentName: 'contact-widget-editor'
      },
      defaults: {
        width: 4,
        height: 4,
        expandable: false,
        heading: '',
        accentLine: 'primary'
      }
    },
    {
      id: 'chart-widget-web-component',
      name: 'Chart (web-component)',
      componentFactory: {
        factoryType: 'web-component',
        url: `${environment.webComponentsBaseUrl}/webcomponent-widgets.js`,
        componentName: 'chart-widget'
      },
      defaults: {
        width: 12,
        height: 4
      },
      payload: {
        config: {
          stacked: true,
          showLegend: false
        }
      }
    },
    DOWNLOAD_WIDGET,
    UPLOAD_WIDGET
  ];

  protected readonly kioskMode = signal(true);
}
