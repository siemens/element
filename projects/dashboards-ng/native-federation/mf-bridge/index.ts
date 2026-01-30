/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, EnvironmentInjector, Injector, ViewContainerRef, Type } from '@angular/core';
import { ModuleFederation } from '@module-federation/runtime';
import {
  FederatedBridgeModule,
  SetupComponentFn,
  widgetFactoryRegistry
} from '@siemens/dashboards-ng';
import { Observable, Subject } from 'rxjs';

function setupRemoteComponent<T>(
  this: ModuleFederation,
  factory: FederatedBridgeModule,
  componentName: string,
  host: ViewContainerRef,
  injector: Injector,
  environmentInjector: EnvironmentInjector
): Observable<ComponentRef<T>> {
  const result = new Subject<ComponentRef<T>>();
  this.loadRemote<Type<T>[]>(factory.id, factory.options).then(
    module => {
      if (module) {
        const componentType = module[factory[componentName]];
        const widgetInstanceRef = host.createComponent<T>(componentType, {
          injector,
          environmentInjector
        });
        result.next(widgetInstanceRef);
      }
      result.complete();
    },
    rejection => {
      const msg = rejection
        ? `Loading widget module ${factory.exposedModule} failed with ${JSON.stringify(
            rejection.toString()
          )}`
        : `Loading widget module ${factory.exposedModule} failed`;
      result.error(msg);
      result.complete();
    }
  );
  return result;
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
