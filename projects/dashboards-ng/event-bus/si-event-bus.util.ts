/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SiEventBusImpl } from './si-event-bus.impl';
import type { SiEventBusApi, SiEventBusOptions } from './si-event-bus.model';

const instances = new Map<string, SiEventBusApi>();

/**
 * Returns an event bus instance for the given default `source`, defaulting to `/`.
 * Repeated calls with the same source return the same instance.
 *
 * All instances share their events and state through `window`, so they stay in sync
 * with each other, also across separately built Angular runtimes (e.g. web components
 * or module federation remotes) and non-Angular code (plain JS/TS, React, Vue, etc.).
 *
 * @example
 * ```ts
 * import { getEventBusInstance } from '@siemens/dashboards-ng/event-bus';
 *
 * const eventBus = getEventBusInstance({ source: '/widgets/my-react-widget' });
 * eventBus.on('app.theme').subscribe(event => console.log(event.data));
 * eventBus.emit('app.language', 'de');
 * ```
 */
export const getEventBusInstance = (options?: SiEventBusOptions): SiEventBusApi => {
  const source = options?.source ?? '/';
  let instance = instances.get(source);
  if (!instance) {
    instance = new SiEventBusImpl(source);
    instances.set(source, instance);
  }
  return instance;
};
