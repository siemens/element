/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { WidgetConfig } from '@spike-rabbit/dashboards-ng';

export const WIDGET: WidgetConfig[] = [
  {
    id: '1',
    widgetId: '@siemens/dashboards-demo/line-chart',
    width: 12,
    height: 4,
    minWidth: 3,
    minHeight: 2,
    heading: 'Line Chart',
    expandable: true,
    payload: {
      datasourceId: 'getLineChartData',
      config: {
        stacked: false,
        showLegend: true
      }
    }
  }
];

export const WIDGETS: WidgetConfig[] = [
  {
    id: 'zy1c8bx',
    heading: 'Project Issues!',
    widgetId: '@siemens/dashboards-demo/value',
    minWidth: 3,
    x: 0,
    y: 0,
    width: 5,
    height: 3,
    image: {
      src: './assets/images/building-1.webp',
      alt: 'Buildings at scale',
      objectFit: 'cover',
      dir: 'horizontal'
    },
    payload: {
      datasourceId: 'getValueWidgetValue'
    }
  },
  {
    id: '1',
    widgetId: '@siemens/dashboards-demo/bar-chart',
    width: 7,
    x: 5,
    y: 0,
    height: 3,
    minWidth: 5,
    minHeight: 3,
    heading: 'Bar Chart',
    expandable: true,
    payload: {
      datasourceId: 'getBarChartData',
      config: {
        stacked: true,
        showLegend: true
      }
    }
  },
  {
    id: '2',
    widgetId: '@siemens/dashboards-demo/circle-chart',
    width: 5,
    height: 3,
    minWidth: 3,
    minHeight: 3,
    heading: 'Pie Chart',
    expandable: true,
    payload: {
      datasourceId: 'getPieChartData'
    }
  },
  {
    id: '3',
    widgetId: '@siemens/dashboards-demo/gauge',
    width: 3,
    height: 3,
    minWidth: 3,
    minHeight: 3,
    heading: 'Full Speed',
    payload: {
      datasourceId: 'getGaugeChartData',
      config: {
        minValue: 0,
        maxValue: 200,
        splitSteps: 5
      }
    }
  },
  {
    id: '5',
    widgetId: '@siemens/dashboards-demo/line-chart',
    width: 8,
    height: 3,
    minWidth: 3,
    minHeight: 2,
    heading: 'Line Chart',
    expandable: true,
    payload: {
      datasourceId: 'getLineChartData',
      config: {
        stacked: false,
        showLegend: false
      }
    }
  },
  {
    id: '6',
    heading: 'List Widget',
    widgetId: '@siemens/dashboards-demo/list',
    minWidth: 3,
    x: 8,
    y: 3,
    width: 4,
    height: 6,
    payload: {}
  },
  {
    id: '7',
    heading: 'Timeline Widget',
    widgetId: '@siemens/dashboards-demo/timeline',
    minWidth: 3,
    width: 4,
    height: 4,
    payload: {}
  }
];

export const FIXED_WIDGETS: WidgetConfig[] = [
  {
    id: '1',
    widgetId: '@siemens/dashboards-demo/bar-chart',
    width: 5,
    height: 4,
    minWidth: 4,
    minHeight: 4,
    heading: 'Bar Chart',
    expandable: true,
    payload: {
      datasourceId: 'getBarChartData',
      config: {
        stacked: true,
        showLegend: true
      }
    }
  },
  {
    id: '3',
    widgetId: '@siemens/dashboards-demo/gauge',
    width: 3,
    height: 4,
    minWidth: 3,
    minHeight: 3,
    heading: 'Full Speed',
    payload: {
      datasourceId: 'getGaugeChartData',
      config: {
        minValue: 0,
        maxValue: 200,
        splitSteps: 5
      }
    }
  },
  {
    id: '2',
    widgetId: '@siemens/dashboards-demo/circle-chart',
    width: 2,
    height: 3,
    minWidth: 2,
    minHeight: 3,
    heading: 'Pie Chart',
    expandable: true,
    payload: {
      datasourceId: 'getPieChartData'
    }
  }
];
