/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { loadRemoteModule } from '@angular-architects/module-federation';
import { ComponentRef, EnvironmentInjector, Injector, ViewContainerRef } from '@angular/core';
import {
  FederatedModule,
  FederatedModuleExports,
  handleFederatedModuleLoad,
  SetupComponentFn,
  widgetFactoryRegistry
} from '@siemens/dashboards-ng';
import { Observable } from 'rxjs';

const setupRemoteComponent = <T>(
  factory: FederatedModule,
  componentName: string,
  host: ViewContainerRef,
  injector: Injector,
  environmentInjector: EnvironmentInjector
): Observable<ComponentRef<T>> =>
  handleFederatedModuleLoad({
    loadPromise: loadRemoteModule<FederatedModuleExports<T>>(factory),
    factory,
    componentName,
    host,
    injector,
    environmentInjector
  });

export const registerModuleFederatedWidgetLoader = (): void => {
  widgetFactoryRegistry.register('module-federation', setupRemoteComponent as SetupComponentFn);
};
