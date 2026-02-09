/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, EnvironmentInjector, Injector, ViewContainerRef } from '@angular/core';
import { ModuleFederation } from '@module-federation/runtime';
import {
  FederatedBridgeModule,
  FederatedModuleExports,
  handleFederatedModuleLoad,
  SetupComponentFn,
  widgetFactoryRegistry
} from '@siemens/dashboards-ng';
import { Observable } from 'rxjs';

function setupRemoteComponent<T>(
  this: ModuleFederation,
  factory: FederatedBridgeModule,
  componentName: string,
  host: ViewContainerRef,
  injector: Injector,
  environmentInjector: EnvironmentInjector
): Observable<ComponentRef<T>> {
  return handleFederatedModuleLoad({
    loadPromise: this.loadRemote<FederatedModuleExports<T>>(factory.id, factory.options),
    factory,
    componentName,
    host,
    injector,
    environmentInjector
  });
}

/**
 * Use this when having native federation shell and remote module is using module federation.
 * @param mfInstance - The ModuleFederation instance returned by `createInstance` from '\@module-federation/runtime'
 */
export const registerModuleFederatedWidgetLoader = (mfInstance: ModuleFederation): void => {
  widgetFactoryRegistry.register(
    'native-federation-module-bridge',
    setupRemoteComponent.bind(mfInstance) as SetupComponentFn
  );
};
