/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ProgressChartSeries {
  name: string;
  percent: number;
}

export interface ProgressValueUpdate {
  seriesIndex: number;
  percent: number;
}
