/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@siemens/dashboards-ng';

const loaderFunction = async (name: string): Promise<any> => {
  if (name === 'HelloWidgetComponent' || name === 'HelloWidgetEditorComponent') {
    return import('./index').then(m => m[name as keyof typeof m]);
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
    componentLoader: loaderFunction
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
