/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SimplChartsNgModule } from '@siemens/charts-ng';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { CartesianChartData } from 'projects/dashboards-demo/src/app/widgets/charts/data.service';
import { Observable, of } from 'rxjs';

export interface WidgetChartCartesianConfig {
  stacked: boolean;
  showLegend: boolean;
  themeCustomization?: any;
}

@Component({
  selector: 'app-chart-widget',
  imports: [SimplChartsNgModule, SiResizeObserverModule, AsyncPipe],
  templateUrl: './chart-widget.component.html'
})
export class ChartWidgetComponent implements OnInit, WidgetInstance {
  @Input() config!: WidgetConfig;
  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Print', action: () => alert('do print') }
  ];
  secondaryActions: MenuItem[] = [
    {
      type: 'action',
      label: 'Configure view',
      action: () => alert('Widget specific configuration completed.')
    },
    { type: 'action', label: 'Send to customer', action: () => alert('Sending completed.') }
  ];

  data!: Observable<CartesianChartData>;

  ngOnInit(): void {
    this.data = this.getCartesianChartData();
  }

  get cartesianConfig(): WidgetChartCartesianConfig {
    return this.config.payload.config as WidgetChartCartesianConfig;
  }

  private getCartesianChartData(): Observable<CartesianChartData> {
    const data: CartesianChartData = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Danger',
          data: [5, 4, 3, 2, 1],
          type: 'bar'
        },
        {
          name: 'Warning',
          data: [11, 9, 7, 5, 3],
          type: 'bar'
        },
        {
          name: 'Success',
          data: [10, 15, 20, 25, 30],
          type: 'bar'
        }
      ]
    };

    return of(data);
  }
}
