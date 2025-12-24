/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export const NATIVE_CHARTS_NG_MAPPINGS: { [symbol: string]: string } = {
  // Components
  'SiNChartGaugeComponent': '@siemens/native-charts-ng/gauge',
  'SiMicrochartBarComponent': '@siemens/native-charts-ng/microchart-bar',
  'SiMicrochartDonutComponent': '@siemens/native-charts-ng/microchart-donut',
  'SiMicrochartLineComponent': '@siemens/native-charts-ng/microchart-line',
  'SiMicrochartProgressComponent': '@siemens/native-charts-ng/microchart-progress',

  // Module
  'SiNativeChartsNgModule': '@siemens/native-charts-ng',
  'SimplNativeChartsNgModule': '@siemens/native-charts-ng',

  // Interfaces - Gauge
  'GaugeSeries': '@siemens/native-charts-ng/gauge',
  'GaugeSegment': '@siemens/native-charts-ng/gauge',

  // Interfaces - Microchart Bar
  'MicrochartBarSeries': '@siemens/native-charts-ng/microchart-bar',

  // Interfaces - Microchart Donut
  'MicrochartDonutSeries': '@siemens/native-charts-ng/microchart-donut',

  // Interfaces - Microchart Line
  'MicrochartLineSeries': '@siemens/native-charts-ng/microchart-line',

  // Interfaces - Microchart Progress
  'MicrochartProgressSeries': '@siemens/native-charts-ng/microchart-progress',

  // Utilities
  'Coordinate': '@siemens/native-charts-ng/utils',
  'polarToCartesian': '@siemens/native-charts-ng/utils',
  'makeArc': '@siemens/native-charts-ng/utils',
  'makeLine': '@siemens/native-charts-ng/utils',
  'makePolyline': '@siemens/native-charts-ng/utils',
  'valueToRelativeAngle': '@siemens/native-charts-ng/utils'
};
