/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SiEventBusImpl } from './si-event-bus.impl';
import type { SiEventBusApi, SiEventType } from './si-event-bus.model';

const eventBusInstanceSymbol = Symbol.for('eventBusInstance');

/**
 * Creates a new event bus instance. All instances share their state and events
 * through `window`, so they stay in sync with each other.
 *
 * Used by the Angular `SiEventBus` service so that every Angular runtime keeps
 * its own instance instead of sharing the `window` singleton of another runtime.
 *
 * @internal
 */
export const createEventBus = <
  ET extends { name: string; data: unknown } = SiEventType
>(): SiEventBusApi<ET> => new SiEventBusImpl<ET>();

/**
 * Returns a singleton {@link SiEventBusApi} instance stored on `window`.
 *
 * Use this in non-Angular applications (plain JS/TS, React, Vue, etc.) that
 * need to participate in the same event bus as Angular dashboard widgets.
 * The instance is shared across all callers via a `Symbol`-keyed property on
 * `window`, so every framework gets the exact same object — just like Angular's
 * `providedIn: 'root'` singleton, but without depending on Angular's DI.
 *
 * @example
 * ```ts
 * import { getEventBusInstance } from '@siemens/dashboards-ng/event-bus';
 *
 * const eventBus = getEventBusInstance();
 * eventBus.on('themeChange').subscribe(theme => console.log(theme));
 * eventBus.emit('languageChange', 'de');
 * ```
 */
export const getEventBusInstance = <
  ET extends { name: string; data: unknown } = SiEventType
>(): SiEventBusApi<ET> => {
  const win = window as unknown as Record<symbol, unknown>;
  if (!win[eventBusInstanceSymbol]) {
    Object.defineProperty(window, eventBusInstanceSymbol, {
      value: createEventBus<ET>(),
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  return win[eventBusInstanceSymbol] as SiEventBusApi<ET>;
};
