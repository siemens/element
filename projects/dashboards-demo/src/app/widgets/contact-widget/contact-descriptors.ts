/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Widget } from '@siemens/dashboards-ng';

const loaderFunction = async (name: string): Promise<any> => {
  if (name === 'ContactWidgetComponent' || name === 'ContactWidgetEditorComponent') {
    return import('./index').then(m => m[name as keyof typeof m]);
  } else {
    throw new Error(`Unknown component to be loaded ${name}`);
  }
};

export const WIZARD_WIDGET_DESCRIPTOR: Widget = {
  name: 'Contact',
  id: '@siemens/dashboards-demo/ContactWidget',
  iconClass: 'element-user',
  description: 'Add a contact card to your dashboard.',
  componentFactory: {
    componentName: 'ContactWidgetComponent',
    editorComponentName: 'ContactWidgetEditorComponent',
    componentLoader: loaderFunction
  },
  defaults: {
    width: 4,
    height: 4,
    expandable: false,
    heading: '',
    accentLine: 'primary'
  },
  payload: {}
};
