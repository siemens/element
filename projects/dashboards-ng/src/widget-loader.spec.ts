/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { EnvironmentInjector, Injector, ViewContainerRef } from '@angular/core';

import { WidgetComponentTypeFactory } from './model/widgets.model';
import { SetupComponentFn, setupWidgetInstance, widgetFactoryRegistry } from './widget-loader';

describe('widget-loader', () => {
  it('should return error on wrong component configuration', (done: DoneFn) => {
    const brokenComponentFactory = {
      componentXName: 'TestWidgetComponent',
      editorComponentName: 'TestWidgetEditorComponent',
      moduleName: 'TestWidgetModule'
    } as any as WidgetComponentTypeFactory;

    setupWidgetInstance(
      brokenComponentFactory,
      {} as ViewContainerRef,
      {} as Injector,
      {} as EnvironmentInjector
    ).subscribe({
      error: error => {
        expect(error).toBe(
          'Provided component factory has no componentName component configuration'
        );
        done();
      }
    });
  });
});

describe('widgetFactoryRegistry', () => {
  it('#hasFactoryFn() should return false for a not existing factory function', () => {
    expect(widgetFactoryRegistry.hasFactoryFn('nothing')).toBeFalse();
  });

  it('#register() should add a factory function to the registry', () => {
    const factoryFn = {} as SetupComponentFn;
    widgetFactoryRegistry.register('my-function', factoryFn);
    expect(widgetFactoryRegistry.hasFactoryFn('my-function')).toBeTrue();
    expect(widgetFactoryRegistry.getFactoryFn('my-function')).toBe(factoryFn);
  });
});
