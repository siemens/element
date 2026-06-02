/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@siemens/dashboards-ng';

import { DEFAULT_WEATHER_PAYLOAD } from './weather-widget.mocks';

const loaderFunction = async (name: string): Promise<any> => {
  if (name === 'WeatherWidgetComponent' || name === 'WeatherWidgetEditorComponent') {
    return import('./index').then(m => m[name as keyof typeof m]);
  } else {
    throw new Error(`Unknown component to be loaded ${name}`);
  }
};

export const WEATHER_WIDGET: Widget = {
  name: 'Weather',
  id: '@siemens/dashboards-demo/weather',
  description: 'Current weather and multi-day forecast',
  iconClass: 'element-cloud',
  componentFactory: {
    componentName: 'WeatherWidgetComponent',
    editorComponentName: 'WeatherWidgetEditorComponent',
    componentLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 6,
    heading: 'Weather',
    expandable: true
  },
  payload: { ...DEFAULT_WEATHER_PAYLOAD }
};
