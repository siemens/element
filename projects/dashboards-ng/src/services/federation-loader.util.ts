/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, EnvironmentInjector, Injector, ViewContainerRef, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Common factory configuration fields required for federated module loading.
 * @internal
 */
export interface FederationFactoryBase {
  exposedModule?: string;
  [key: string]: unknown;
}

/**
 * Module loaded from federation, containing exported components keyed by name.
 * @internal
 */
export type FederatedModuleExports<T> = Record<string, Type<T>>;

/**
 * Options for handling federated module loading.
 */
interface FederatedModuleLoadOptions<T> {
  loadPromise: Promise<FederatedModuleExports<T> | null | undefined>;
  factory: FederationFactoryBase;
  componentName: string;
  host: ViewContainerRef;
  injector: Injector;
  environmentInjector: EnvironmentInjector;
}

/**
 * Formats an error message for failed module loading.
 */
const formatLoadingError = (factory: FederationFactoryBase, rejection: unknown): string =>
  rejection
    ? `Loading widget module ${factory.exposedModule} failed with ${String(rejection)}`
    : `Loading widget module ${factory.exposedModule} failed`;

/**
 * Handles the result of a federated module loading promise.
 * This is the main utility function that encapsulates the common loading pattern
 * used across module-federation, native-federation, and mf-bridge loaders.
 *
 * @param options - Configuration options for loading and creating the component
 * @returns Observable that emits the ComponentRef once the component is created
 * @internal
 */
export const handleFederatedModuleLoad = <T>({
  loadPromise,
  factory,
  componentName,
  host,
  injector,
  environmentInjector
}: FederatedModuleLoadOptions<T>): Observable<ComponentRef<T>> => {
  const result = new Subject<ComponentRef<T>>();

  loadPromise.then(
    module => {
      if (module) {
        const componentType = module[factory[componentName] as string];
        const widgetInstanceRef = host.createComponent<T>(componentType, {
          injector,
          environmentInjector
        });
        result.next(widgetInstanceRef);
      }
      result.complete();
    },
    rejection => result.error(formatLoadingError(factory, rejection))
  );

  return result;
};
