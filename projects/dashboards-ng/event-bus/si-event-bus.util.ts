/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SiEventBusBase, EventType } from './si-event-bus.base';

const eventBusInstanceSymbol = Symbol.for('eventBusInstance');

/**
 * Returns a singleton {@link SiEventBusBase} instance stored on `window`.
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
  ET extends { name: string; data: unknown } = EventType
>(): SiEventBusBase<ET> => {
  const win = window as unknown as Record<symbol, unknown>;
  if (!win[eventBusInstanceSymbol]) {
    Object.defineProperty(window, eventBusInstanceSymbol, {
      value: new SiEventBusBase<ET>(),
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  return win[eventBusInstanceSymbol] as SiEventBusBase<ET>;
};
