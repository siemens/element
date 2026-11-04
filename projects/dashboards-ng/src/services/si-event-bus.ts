/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable, InjectionToken } from '@angular/core';
import { getEventBusInstance, SiEventBusApi } from '@siemens/dashboards-ng/event-bus';

/**
 * Default `source` of events emitted through the {@link SiEventBus} service.
 * Defaults to `/`.
 */
export const SI_EVENT_BUS_SOURCE = new InjectionToken<string>('SI_EVENT_BUS_SOURCE');

/**
 * Injectable event bus service for cross-widget communication. It implements
 * {@link SiEventBusApi}, the same interface returned by `getEventBusInstance()`
 * for non-Angular code.
 *
 * Event types and their data are typed via `SiEventMap`, which can be extended
 * by module augmentation, see `@siemens/dashboards-ng/event-bus`.
 *
 * @example
 * ```ts
 * const eventBus = inject(SiEventBus);
 * eventBus.emit('filter.timeZone', 'Europe/Berlin');
 * eventBus.on('filter.*').subscribe(event => console.log(event.type, event.data));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SiEventBus implements SiEventBusApi {
  private readonly eventBus = getEventBusInstance({
    source: inject(SI_EVENT_BUS_SOURCE, { optional: true }) ?? undefined
  });

  /** Emits an event to all subscribers. See {@link SiEventBusApi.emit}. */
  readonly emit: SiEventBusApi['emit'] = this.eventBus.emit.bind(this.eventBus);

  /** Subscribes to all events matching the given pattern(s). See {@link SiEventBusApi.on}. */
  readonly on: SiEventBusApi['on'] = this.eventBus.on.bind(this.eventBus);

  /** Returns the latest event of the given type. See {@link SiEventBusApi.snapshot}. */
  readonly snapshot: SiEventBusApi['snapshot'] = this.eventBus.snapshot.bind(this.eventBus);
}

export type {
  SiEmitOptions,
  SiEvent,
  SiEventBusApi,
  SiEventMap,
  SiEventPattern,
  SiEventType
} from '@siemens/dashboards-ng/event-bus';
