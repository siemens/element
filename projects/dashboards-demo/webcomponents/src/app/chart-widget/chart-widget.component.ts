/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { EventBus, WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import {
  CartesianChartData,
  CustomEventTypes,
  days,
  Filter,
  severity
} from 'projects/dashboards-demo/src/app/widgets/charts/data.service';
import { combineLatest, map, Observable, of, shareReplay, startWith } from 'rxjs';

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
  private eventBus = inject(EventBus<CustomEventTypes>);

  readonly filter = this.eventBus.on('filters').pipe(startWith(this.eventBus.currentEventsState?.filters ?? []));
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
      map<[CartesianChartData, Filter[]], CartesianChartData>(([result, filters]) => {
        const filteredData = JSON.parse(JSON.stringify(result));

        const severityFilter = filters?.find(f => f.key === 'severity');
        const daysFilter = filters?.find(f => f.key === 'days');

        if (severityFilter?.value && severityFilter.value !== severity[0]) {
          filteredData.series = filteredData.series.filter(
            (entry: any) => entry.name === severityFilter.value
          );
        }

        if (daysFilter?.value && daysFilter.value !== days[0]) {
          const index = days.indexOf(daysFilter.value) - 1;
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
