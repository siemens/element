/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@siemens/dashboards-ng';

const loaderFunction = (name: string): Promise<any> => {
  if (
    name === 'CircleComponent' ||
    name === 'CartesianComponent' ||
    name === 'GaugeComponent' ||
    name === 'ValueWidgetComponent' ||
    name === 'ValueWidgetEditorComponent' ||
    name === 'ListWidgetComponent' ||
    name === 'TimelineWidgetComponent'
  ) {
    return import('../../widgets/charts/index');
  } else {
    throw new Error(`Unknown component to be loaded ${name}`);
  }
};

export const LINE_CHART_DESC: Widget = {
  name: 'Line Chart',
  id: '@siemens/dashboards-demo/line-chart',
  description: `A line chart is a type of chart used to show information that changes over time.\
  Line charts are created by plotting a series of several points and connecting them with a straight line.\
  Line charts are used to track changes over short and long periods.`,
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'CartesianComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 6,
    height: 3,
    heading: 'Changes per week day',
    expandable: true
  },
  payload: {
    datasourceId: 'getLineChartData',
    config: {
      stacked: false,
      showLegend: true
    }
  }
};

export const BAR_CHART_DESC: Widget = {
  name: 'Bar Chart',
  id: '@siemens/dashboards-demo/bar-chart',
  description: 'This is a bar chart widget.',
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'CartesianComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 12,
    height: 3,
    heading: 'Commits vs. Coffee',
    expandable: true
  },
  payload: {
    datasourceId: 'getBarChartData',
    config: {
      stacked: true,
      showLegend: true
    }
  }
};

export const CIRCLE_CHART_DESC: Widget = {
  name: 'Circle Chart',
  id: '@siemens/dashboards-demo/circle-chart',
  description: 'This is a cart with a circle.',
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'CircleComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 3,
    heading: 'My Circle Chart',
    expandable: true,
    image: {
      src: './assets/images/building-1.webp',
      alt: 'Buildings at night',
      objectFit: 'cover',
      dir: 'horizontal'
    }
  },
  payload: {
    datasourceId: 'getPieChartData'
  }
};

export const GAUGE_CHART_DESC: Widget = {
  name: 'Gauge Chart',
  id: '@siemens/dashboards-demo/gauge',
  description: 'A nice gauge charts',
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'GaugeComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 3,
    heading: 'Reasons to remember the name'
  },
  payload: {
    datasourceId: 'getGaugeChartData',
    config: {
      minValue: 0,
      maxValue: 200,
      splitSteps: 5
    }
  }
};

export const VALUE_WIDGET: Widget = {
  name: 'Value Widget',
  id: '@siemens/dashboards-demo/value',
  description: 'Displays a single KPI',
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'ValueWidgetComponent',
    editorComponentName: 'ValueWidgetEditorComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 3,
    heading: 'Value Widget',
    image: {
      src: './assets/images/building-1.webp',
      alt: 'Buildings at scale',
      objectFit: 'cover',
      dir: 'horizontal'
    }
  },
  payload: {
    datasourceId: 'getValueWidgetValue'
  }
};

export const LIST_WIDGET: Widget = {
  name: 'List Widget',
  id: '@siemens/dashboards-demo/list',
  description: 'Displays a list of items',
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'ListWidgetComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 6,
    heading: 'List Widget'
  }
};

export const TIMELINE_WIDGET: Widget = {
  name: 'Timeline Widget',
  id: '@siemens/dashboards-demo/timeline',
  description: 'Displays events or steps over a period of time',
  iconClass: 'element-trend',
  componentFactory: {
    componentName: 'TimelineWidgetComponent',
    moduleName: 'ChartsWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 4,
    heading: 'Timeline Widget'
  }
};
