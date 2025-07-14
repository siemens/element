/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, InjectionToken, PLATFORM_ID, Provider, Type } from '@angular/core';

const SI_UI_STATE_STORAGE = new InjectionToken<UIStateStorage>('si.ui-state.storage', {
  providedIn: 'root',
  factory: () => {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      return new LocalStorageUIStateStorage();
    }
    return { save: () => {}, load: () => null };
  }
});

/**
 * Interface that defines a UIStateStore.
 * It must be provided via {@link provideSiUiState}.
 */
export interface UIStateStorage {
  /**
   * Saves data under a specific stateId.
   * Already existing data for that stateId should be overridden.
   * Asynchronous implementations must return a {@link Promise} and resolve it once saving was completed.
   *
   * Errors should be handled by the implementation.
   * The `SiUIStateService` does not handle errors.
   */
  save(stateId: string, data: string): void | Promise<void>;

  /**
   * Loads data for a specific stateId.
   * Can be asynchronous.
   *
   * Errors should be handled by the implementation.
   * The `SiUIStateService` does not handle errors.
   *
   * @returns The data or undefined if the data does not exist.
   * Asynchronous implementations must return a {@link Promise} containing the data.
   */
  load(stateId: string): string | undefined | null | Promise<string | undefined | null>;
}

class LocalStorageUIStateStorage implements UIStateStorage {
  save(stateId: string, data: string): void {
    localStorage.setItem(`si.ui-state.${stateId}`, data);
  }

  load(stateId: string): string | null {
    return localStorage.getItem(`si.ui-state.${stateId}`);
  }
}

/** @internal */
export const SI_UI_STATE_SERVICE = new InjectionToken<SiUIStateService>('si.ui-state.service');

/**
 * Service to save and load UI states.
 * @internal
 */
@Injectable()
class SiUIStateService {
  private storage = inject(SI_UI_STATE_STORAGE);

  /**
   * Saves the provided state in the storage.
   * @param stateId - The unique id or key under which the state shall be saved.
   * @param state - The state to be saved.
   * @param version - The version of the state object.
   * This can be used to migrate state objects.
   */
  save<TState>(stateId: string, state: TState, version = 0): Promise<void> {
    return (
      this.storage.save(
        stateId,
        JSON.stringify({
          version,
          state
        })
      ) ?? Promise.resolve()
    );
  }

  /**
   * Loads and returns the state for the given stateId and version.
   * @param stateId - The unique id or key for which the state shall be loaded.
   * @param version - The version of the state object.
   * This can be used to migrate state objects.
   * @returns A Promise containing the state or undefined if the state does not exist or the version did not match.
   */
  load<TState = unknown>(stateId: string, version = 0): PromiseLike<TState | undefined> {
    // DO NOT ADD async keyword.
    // This method should stay synchronous if the storage is synchronous.
    // Otherwise, the navbar will play expand animations on load.
    const dataOrPromise = this.storage.load(stateId);
    if (dataOrPromise instanceof Promise) {
      return dataOrPromise.then(data => this.readData(data, version));
    } else {
      const promiseLike = {
        then: onfulfilled => {
          const data = this.readData<TState>(dataOrPromise, version);
          if (onfulfilled) {
            return onfulfilled(data);
          } else {
            return promiseLike;
          }
        }
      } as PromiseLike<TState | undefined>;

      return promiseLike;
    }
  }

  private readData<TState = unknown>(
    data: string | null | undefined,
    version: number
  ): TState | undefined {
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.version === version) {
        return parsed.state;
      }
    }

    return undefined;
  }
}

export type { SiUIStateService };

/** Enables the automatic storage of UI state for enabled components. */
export const provideSiUiState = (config?: { store?: Type<UIStateStorage> }): Provider[] => {
  return [
    { provide: SI_UI_STATE_SERVICE, useClass: SiUIStateService },
    config?.store ? { provide: SI_UI_STATE_STORAGE, useClass: config.store } : []
  ];
};
