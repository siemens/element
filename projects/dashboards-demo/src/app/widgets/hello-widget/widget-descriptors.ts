/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@spike-rabbit/dashboards-ng';

const loaderFunction = (name: string): Promise<any> => {
  if (name === 'HelloWidgetComponent' || name === 'HelloWidgetEditorComponent') {
    return import('../../widgets/hello-widget/index');
  } else {
    throw new Error(`Unknown component to be loaded ${name}`);
  }
};

export const HELLO_DESCRIPTOR: Widget = {
  name: 'Hello World',
  id: '@siemens/dashboards-demo/HelloWorld',
  iconClass: 'element-report',
  description: 'A dummy widget for testing.',
  componentFactory: {
    componentName: 'HelloWidgetComponent',
    editorComponentName: 'HelloWidgetEditorComponent',
    editorModalClass: 'modal-sm',
    moduleName: 'HelloWidgetModule',
    moduleLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 2,
    expandable: true
  },
  payload: {
    message: 'Hello Widgets!'
  }
};
