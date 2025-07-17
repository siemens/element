/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Widget, WidgetConfig } from '@siemens/dashboards-ng';

const loaderFunction = (name: string): Promise<any> => {
  if (name === 'TestWidgetComponent' || name === 'TestWidgetEditorComponent') {
    return import('projects/dashboards-ng/test/test-widget/index');
  } else {
    throw new Error(`Unknown component to be loaded ${name}`);
  }
};

export const TEST_WIDGET: Widget = {
  name: 'Test Widget',
  id: '@siemens/dashboards-ng/TestWidgetComponent',
  iconClass: 'element-report',
  description: 'A dummy widget for testing.',
  componentFactory: {
    componentName: 'TestWidgetComponent',
    editorComponentName: 'TestWidgetEditorComponent',
    moduleName: 'TestWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 2
  },
  payload: {
    message: 'Test Widgets!'
  }
};

export const TEST_WIDGET_CONFIG_0: WidgetConfig = {
  id: 'TEST_WIDGET_CONFIG_0',
  widgetId: TEST_WIDGET.id,
  x: 0,
  y: 0,
  width: 6,
  height: 2,
  payload: {
    message: 'Test Widgets!'
  }
};

export const TEST_WIDGET_CONFIG_1: WidgetConfig = {
  id: 'TEST_WIDGET_CONFIG_1',
  widgetId: TEST_WIDGET.id,
  x: 6,
  y: 0,
  width: 6,
  height: 2,
  payload: {
    message: 'My other widget!'
  }
};

export const TEST_WIDGET_CONFIG_2: WidgetConfig = {
  id: 'TEST_WIDGET_CONFIG_2',
  widgetId: TEST_WIDGET.id,
  x: 0,
  y: 2,
  width: 6,
  height: 2,
  payload: {
    message: 'My other widget!'
  }
};

export const TEST_WIDGET_CONFIGS = [
  TEST_WIDGET_CONFIG_0,
  TEST_WIDGET_CONFIG_1,
  TEST_WIDGET_CONFIG_2
];
