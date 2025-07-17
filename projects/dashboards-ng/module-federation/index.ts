/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { loadRemoteModule } from '@angular-architects/module-federation';
import { ComponentRef, EnvironmentInjector, Injector, ViewContainerRef } from '@angular/core';
import { FederatedModule, SetupComponentFn, widgetFactoryRegistry } from '@siemens/dashboards-ng';
import { Observable, Subject } from 'rxjs';

const setupRemoteComponent = <T>(
  factory: FederatedModule,
  componentName: string,
  host: ViewContainerRef,
  injector: Injector,
  environmentInjector: EnvironmentInjector
): Observable<ComponentRef<T>> => {
  const result = new Subject<ComponentRef<T>>();

  loadRemoteModule(factory).then(
    (module: any) => {
      const componentType = module[factory[componentName]];
      const widgetInstanceRef = host.createComponent<T>(componentType, {
        injector,
        environmentInjector
      });
      result.next(widgetInstanceRef);
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
};

export const registerModuleFederatedWidgetLoader = (): void => {
  widgetFactoryRegistry.register('module-federation', setupRemoteComponent as SetupComponentFn);
};
