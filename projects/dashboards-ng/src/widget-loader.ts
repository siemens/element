/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ComponentRef,
  createNgModule,
  EnvironmentInjector,
  Injector,
  ViewContainerRef
} from '@angular/core';
import { Observable, ReplaySubject, Subject, throwError } from 'rxjs';

import { SiWebComponentEditorWrapperComponent } from './components/web-component-wrapper/si-web-component-editor-wrapper.component';
import { SiWebComponentWrapperComponent } from './components/web-component-wrapper/si-web-component-wrapper.component';
import {
  WebComponent,
  WidgetComponentFactory,
  WidgetComponentTypeFactory,
  WidgetInstance,
  WidgetInstanceEditor
} from './model/widgets.model';

export type SetupComponentFn = <T>(
  factory: WidgetComponentFactory,
  componentName: string,
  host: ViewContainerRef,
  injector: Injector,
  envInjector: EnvironmentInjector
) => Observable<ComponentRef<T>>;

export const widgetFactoryRegistry = {
  _factories: {} as { [key: string]: SetupComponentFn },

  register(name: string, factoryFn: SetupComponentFn) {
    this._factories[name] = factoryFn;
  },

  getFactoryFn(name: string) {
    return this._factories[name];
  },

  hasFactoryFn(name: string) {
    return this._factories[name] !== undefined;
  }
};

export const setupWidgetInstance = (
  widgetComponentFactory: WidgetComponentFactory,
  host: ViewContainerRef,
  injector: Injector,
  envInjector: EnvironmentInjector
): Observable<ComponentRef<WidgetInstance>> =>
  setupComponent(
    widgetComponentFactory,
    host,
    injector,
    envInjector,
    'componentName'
  ) as Observable<ComponentRef<WidgetInstance>>;

export const setupWidgetEditor = (
  widgetComponentFactory: WidgetComponentFactory,
  host: ViewContainerRef,
  injector: Injector,
  envInjector: EnvironmentInjector
): Observable<ComponentRef<WidgetInstanceEditor>> =>
  setupComponent(
    widgetComponentFactory,
    host,
    injector,
    envInjector,
    'editorComponentName'
  ) as Observable<ComponentRef<WidgetInstanceEditor>>;

const setupComponent = (
  widgetComponentFactory: WidgetComponentFactory,
  host: ViewContainerRef,
  injector: Injector,
  envInjector: EnvironmentInjector,
  componentName: 'componentName' | 'editorComponentName'
): Observable<ComponentRef<WidgetInstance>> | Observable<ComponentRef<WidgetInstanceEditor>> => {
  if (!widgetComponentFactory.factoryType || widgetComponentFactory.factoryType === 'default') {
    return loadAndAttachComponent<WidgetInstance>(
      widgetComponentFactory as WidgetComponentTypeFactory,
      componentName,
      host,
      injector,
      envInjector
    );
  } else if (widgetComponentFactory.factoryType === 'web-component') {
    return loadAndAttachWebComponentWrapper(widgetComponentFactory, componentName, host);
  } else if (widgetFactoryRegistry.hasFactoryFn(widgetComponentFactory.factoryType)) {
    const setupFn = widgetFactoryRegistry.getFactoryFn(widgetComponentFactory.factoryType);
    return setupFn!<WidgetInstance>(
      widgetComponentFactory as any,
      componentName,
      host,
      injector,
      envInjector
    );
  } else {
    return throwError(
      () => new Error(`Unknown widget factory type ${widgetComponentFactory.factoryType}.`)
    );
  }
};

const loadAndAttachComponent = <T>(
  factory: WidgetComponentTypeFactory,
  componentName: 'componentName' | 'editorComponentName',
  host: ViewContainerRef,
  injector: Injector,
  envInjector: EnvironmentInjector
): Observable<ComponentRef<T>> => {
  const result = new Subject<ComponentRef<T>>();
  if (factory[componentName]) {
    factory.moduleLoader(factory[componentName]!).then(
      module => {
        const ngModuleRef = createNgModule(module[factory.moduleName], envInjector);
        const componentKey = factory[componentName];
        if (!componentKey) {
          throw new Error(`Component configuration for ${componentName} is undefined.`);
        }
        const componentType = module[componentKey];
        const widgetInstanceRef = host.createComponent<T>(componentType, { injector, ngModuleRef });
        result.next(widgetInstanceRef);
        result.complete();
      },
      rejection => {
        const msg = rejection
          ? `Loading widget module ${factory.moduleName} failed with ${JSON.stringify(
              rejection.toString()
            )}`
          : `Loading widget module ${factory.moduleName} failed`;
        result.error(msg);
        result.complete();
      }
    );
  } else {
    result.error(`Provided component factory has no ${componentName} component configuration`);
  }
  return result;
};

const loadAndAttachWebComponentWrapper = (
  factory: WebComponent,
  componentName: 'componentName' | 'editorComponentName',
  host: ViewContainerRef
): Observable<ComponentRef<WidgetInstance>> => {
  const result = new ReplaySubject<ComponentRef<any>>();
  if (factory[componentName]) {
    let widgetInstanceRef: ComponentRef<
      SiWebComponentWrapperComponent | SiWebComponentEditorWrapperComponent
    >;
    if (componentName === 'componentName') {
      widgetInstanceRef = host.createComponent(SiWebComponentWrapperComponent);
    } else {
      widgetInstanceRef = host.createComponent(SiWebComponentEditorWrapperComponent);
    }
    widgetInstanceRef.instance.elementTagName = factory[componentName];
    widgetInstanceRef.instance.url = factory.url;
    result.next(widgetInstanceRef);
    result.complete();
  } else {
    result.error(`Provided component factory has no ${componentName} component configuration`);
  }
  return result;
};
