/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiFlexibleDashboardComponent, Widget } from '@siemens/dashboards-ng';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';

import { environment } from '../../../environments/environment';
import { AppStateService } from '../../app-state.service';
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
import { WEATHER_WIDGET } from '../../widgets/weather';

@Component({
  selector: 'app-dashboard',
  imports: [SiFlexibleDashboardComponent, DashboardFiltersComponent, SiEmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardPageComponent {
  appStateService = inject(AppStateService);
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
    WEATHER_WIDGET,
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
    {
      id: 'native-note-widget-web-component',
      name: 'Note (native web-component)',
      description:
        'Framework-agnostic native web component widget showcasing integration of vanilla custom elements in the flexible dashboard',
      componentFactory: {
        factoryType: 'web-component',
        url: `${environment.webComponentsBaseUrl}/webcomponent-widgets.js`,
        componentName: 'native-note-widget',
        editorComponentName: 'native-note-widget-editor'
      },
      defaults: {
        width: 6,
        height: 2
      },
      payload: {
        message: 'Private notes (native web-component)'
      }
    },
    DOWNLOAD_WIDGET,
    UPLOAD_WIDGET
  ];
}
