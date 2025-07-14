/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, OnInit, viewChild } from '@angular/core';
import {
  AxisPointerEvent,
  CartesianChartData,
  CartesianChartSeries,
  ChartXAxis,
  ChartYAxis,
  DataZoomEvent,
  DataZoomRange,
  SiChartCartesianComponent
} from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

const ONE_HOUR = 1000 * 60 * 60;
const SERIES_NAME = 'Series 1';

const pad = (num: number): string | number => {
  if (num < 10) {
    return '0' + num;
  }
  return num;
};

const formatDateTime = (d: Date | number | string, seconds = false): string => {
  if (typeof d === 'string') {
    d = new Date(d.replace(' ', 'T'));
  } else if (typeof d === 'number') {
    d = new Date(d);
  }

  let s =
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes());

  if (seconds) {
    s += ':' + pad(d.getSeconds());
  }

  return s;
};

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './interactive.html',
  styleUrl: './interactive.scss'
})
export class SampleComponent implements OnInit, OnDestroy {
  readonly trendChart = viewChild.required<SiChartCartesianComponent>('trendChart');

  private fullData: CartesianChartData = [];
  private lowresData: CartesianChartData = [];
  private data: CartesianChartData = [];
  private zoomed = false;
  private liveUpdateTimer: any = 0;
  private liveUpdateIndex = 0;
  private liveUpdateSum = 0;
  private rand: () => number;

  constructor() {
    this.rand = mulberry32(10000);
  }

  timeRanges = [
    { label: 'Hour', range: ONE_HOUR },
    { label: 'Day', range: ONE_HOUR * 24 },
    { label: 'Week', range: ONE_HOUR * 24 * 7 },
    { label: 'Month', range: ONE_HOUR * 24 * 31 },
    { label: 'Year', range: ONE_HOUR * 24 * 365 },
    { label: 'All', range: 0 }
  ];

  currentTimeRange = -1;

  dataZoomRange: DataZoomRange = {};

  dataZoomMinValueSpan = 1; // Min Value span for dataZoom in ms
  rangeStart = '';
  rangeEnd = '';

  xAxisCurrentValue = '-';
  yAxisCurrentValue = '-';

  axisPointer = false;
  liveUpdate = false;
  visible = true;
  zoomMode = false;
  paletteName: undefined;

  chartData = {
    xAxis: { type: 'time', show: false } as ChartXAxis,
    yAxis: [{ type: 'value' }] as ChartYAxis[],
    series: [
      {
        type: 'line',
        name: SERIES_NAME,
        smooth: false,
        showSymbol: false,
        data: this.data,
        customLegendToolTip: 'Tooltip'
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true,
    zoomInside: true,
    autoZoomSeriesIndex: 0
  };

  additionalOptions = {
    // MUST set to false, otherwise EChart bug triggers when switching to low-res
    animation: false,

    tooltip: {
      formatter: (params: any) => {
        params = params[0];
        if (params?.value?.length) {
          return formatDateTime(params.value[0]) + ': ' + params.value[1];
        }
        return '';
      }
    }
  };

  ngOnInit(): void {
    setTimeout(
      () => {
        this.generateData();
        this.printDetails(null);
      },
      navigator.webdriver ? 0 : 1000
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.liveUpdateTimer);
  }

  printDetails(event: DataZoomEvent | null): void {
    const data = this.data as any[];
    if (!event || event.rangeStart === null) {
      event = {
        rangeType: 'time',
        rangeStart: data[0][0],
        rangeEnd: data[this.data.length - 1][0]
      };
    }
    this.rangeStart = formatDateTime(event.rangeStart);
    this.rangeEnd = formatDateTime(event.rangeEnd);
  }

  private findIndexes(data: any[], event: DataZoomEvent): { startIndex: number; endIndex: number } {
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (startIndex === -1 && data[i][0] >= event.rangeStart) {
        startIndex = i;
      }
      if (data[i][0] >= event.rangeEnd) {
        break;
      }
      endIndex = i;
    }
    return {
      startIndex,
      endIndex
    };
  }

  dataZoom(event: DataZoomEvent): void {
    this.printDetails(event);
    this.insertHiResData(event);
  }

  private setData(data: CartesianChartData): void {
    this.data = data;
    this.chartData.series[0].data = data;
  }

  printAxisDetails(event: AxisPointerEvent): void {
    const dataIndex = event.dataIndex;
    if (!dataIndex || !this.data[dataIndex]) {
      this.xAxisCurrentValue = '-';
      this.yAxisCurrentValue = '-';
      return;
    }
    const data = this.data[dataIndex] as any[];
    this.xAxisCurrentValue = formatDateTime(data[0]);
    this.yAxisCurrentValue = data[1];
  }

  toggleAxisPointer(): void {
    this.axisPointer = !this.axisPointer;
  }

  toggleLiveUpdate(): void {
    this.liveUpdate = !this.liveUpdate;

    if (this.liveUpdate) {
      this.liveUpdateTimer = setInterval(() => this.addDataPoint(10), 500);
    } else if (this.liveUpdateTimer) {
      clearInterval(this.liveUpdateTimer);
      this.liveUpdateTimer = 0;
    }
  }

  toggleVisible(): void {
    this.visible = !this.visible;
    this.trendChart().toggleSeriesVisibility(SERIES_NAME, this.visible);
  }

  toggleZoomMode(): void {
    this.zoomMode = !this.zoomMode;
  }

  selectionChanged(items: { [key: string]: boolean }): void {
    if (Object.prototype.hasOwnProperty.call(items, SERIES_NAME)) {
      this.visible = items[SERIES_NAME];
    }
  }

  private insertHiResData(event: DataZoomEvent): void {
    const delta = event.rangeEnd - event.rangeStart;
    if (delta > 1000 * 60 * 60 * 24 * 90) {
      // range is big enough, return to reduced data
      if (this.zoomed) {
        this.zoomed = false;

        this.setData(this.lowresData.slice());
        this.trendChart().refreshSeries();
      }
      return;
    }

    const indexesReduced = this.findIndexes(this.data, event);
    const indexesFull = this.findIndexes(this.fullData, event);

    const numReduced = indexesReduced.endIndex - indexesReduced.startIndex + 1;
    const numFull = indexesFull.endIndex - indexesFull.startIndex + 1;

    if (numReduced < numFull) {
      this.zoomed = true;
      this.data.splice(
        indexesReduced.startIndex,
        numReduced,
        ...this.fullData.slice(indexesFull.startIndex, indexesFull.endIndex)
      );

      this.trendChart().refreshSeries();
    }
  }

  private generateRandomPoints(count: number): void {
    if (this.fullData.length < 1) {
      return;
    }

    for (let i = 0; i < count; i++) {
      this.liveUpdateIndex++;

      const lastPoint = this.fullData[this.fullData.length - 1] as any[];
      const point = [
        lastPoint[0] + ONE_HOUR,
        navigator.webdriver
          ? Math.round(this.rand() * 20 - 10 + lastPoint[1])
          : Math.round(Math.random() * 20 - 10 + lastPoint[1])
      ];
      this.fullData.push(point);

      if (this.zoomed) {
        this.data.push(point);
      }

      this.liveUpdateSum += point[1];
      if (this.liveUpdateIndex % 24 === 0) {
        const avgPoint = [point[0], Math.round(this.liveUpdateSum / 24)];
        this.lowresData.push(avgPoint);
        this.liveUpdateSum = 0;

        if (!this.zoomed) {
          this.data.push(avgPoint);
        }
      }
    }
  }

  private generateData(): void {
    this.fullData.push([+new Date(2014, 0, 1, 0, 0, 0), 0]);
    this.generateRandomPoints(20_000);

    const fullData = this.fullData as any[];
    this.dataZoomRange = { startValue: fullData[1000][0], endValue: fullData[15_000][0] };
    this.trendChart().refreshSeries();
  }

  private addDataPoint(count = 1): void {
    this.generateRandomPoints(count);
    this.trendChart().refreshSeries();
  }
}
