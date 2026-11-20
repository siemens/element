/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { SiEventBus, WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';

import {
  CartesianChartData,
  days,
  Filter,
  filterChanges,
  severity
} from '../../../../src/app/widgets/charts/data.service';

export interface WidgetChartCartesianConfig {
  stacked: boolean;
  showLegend: boolean;
  themeCustomization?: any;
}

@Component({
  selector: 'app-chart-widget',
  imports: [SiChartCartesianComponent, SiResizeObserverModule, AsyncPipe],
  templateUrl: './chart-widget.component.html'
})
export class ChartWidgetComponent implements OnInit, WidgetInstance {
  readonly config = input.required<WidgetConfig>();
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
  private readonly filter = filterChanges(inject(SiEventBus)).pipe(shareReplay(1));

  ngOnInit(): void {
    this.data = this.getCartesianChartData();
  }

  get cartesianConfig(): WidgetChartCartesianConfig {
    return this.config().payload.config as WidgetChartCartesianConfig;
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

    return combineLatest([of(data), this.filter]).pipe(
      map<[CartesianChartData, Filter], CartesianChartData>(([result, filter]) => {
        const filteredData = JSON.parse(JSON.stringify(result));

        if (filter.severity && filter.severity !== severity[0]) {
          filteredData.series = filteredData.series.filter(
            (entry: any) => entry.name === filter.severity
          );
        }

        if (filter.days && filter.days !== days[0]) {
          const index = days.indexOf(filter.days) - 1;
          filteredData.series.forEach((seriesEntry: any) => {
            seriesEntry.data = [seriesEntry.data![index]];
          });
          filteredData.xAxis.data = [filteredData.xAxis.data[index]];
        }
        return filteredData;
      }),
      shareReplay()
    );
  }
}
