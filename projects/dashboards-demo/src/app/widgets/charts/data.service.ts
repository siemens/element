/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { CartesianChartSeries } from '@siemens/charts-ng/cartesian';
import { CircleChartSeries } from '@siemens/charts-ng/circle';
import { ChartXAxis, ChartYAxis } from '@siemens/charts-ng/common';
import { EventBus } from '@siemens/dashboards-ng';
import { combineLatest, map, Observable, of, shareReplay, startWith } from 'rxjs';

export interface CartesianChartData {
  series: CartesianChartSeries[];
  xAxis: ChartXAxis;
  yAxis: ChartYAxis;
}

export interface Filter {
  key: 'days' | 'severity';
  value: string;
}

export const days = ['All week', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const severity = ['All levels', 'Success', 'Warning', 'Danger'];

@Injectable({ providedIn: 'root' })
export class DataService {
  eventBus = inject(EventBus);
  currentFilterArray = Array.isArray(this.eventBus.currentEventsState?.filter) ? this.eventBus.currentEventsState?.filter : [];
  timezone = this.eventBus.on('timeZoneChange').pipe(startWith(this.eventBus.currentEventsState?.timeZoneChange ?? 'us'));
  readonly filter = this.eventBus.on<Filter[]>('filter').pipe(startWith(this.currentFilterArray), shareReplay(1));
  
  private getCartesianChartData(type: string): Observable<CartesianChartData> {
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
        filteredData.series.forEach((seriesEntry: any) => (seriesEntry.type = type));

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

  getBarChartData(): Observable<CartesianChartData> {
    return this.getCartesianChartData('bar');
  }

  getLineChartData(): Observable<CartesianChartData> {
    return this.getCartesianChartData('line');
  }

  getPieChartData(): Observable<CircleChartSeries[]> {
    return this.getCartesianChartData('any').pipe(
      map(data => {
        const aggregatedData: { value: number; name: string }[] = [];

        data.series.forEach(seriesEntry => {
          const sum = (seriesEntry.data! as number[]).reduce(
            (accumulator, value) => accumulator + value,
            0
          );
          aggregatedData.push({ value: sum, name: seriesEntry.name as string });
        });

        return [
          {
            name: 'Issues',
            radius: ['0%', '60%'],
            data: aggregatedData
          }
        ];
      })
    );
  }

  getValueWidgetValue(): Observable<{ value: string; unit: string }> {
    return this.getCartesianChartData('any').pipe(
      map(data => {
        let valueWidgetValue = 0;

        data.series.forEach(seriesEntry => {
          const sum = (seriesEntry.data! as number[]).reduce(
            (accumulator, value) => accumulator + value,
            0
          );
          valueWidgetValue = valueWidgetValue + sum;
        });
        const unit = data.series.length === 1 ? data.series[0].name + ' Issues' : 'Issues';
        return { value: valueWidgetValue.toString(), unit };
      })
    );
  }

  getGaugeChartData(): Observable<number> {
    return this.getCartesianChartData('any').pipe(
      map(data => {
        let result = 0;
        data.series.forEach(seriesEntry =>
          (seriesEntry.data! as number[]).forEach(value => (result = result + value))
        );
        return result;
      })
    );
  }
}
