/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { createEventBus, SiEventBusApi, SiEventType } from '@siemens/dashboards-ng/event-bus';

/**
 * Resolves the generic argument of {@link SiEventBus} to an event type union. Falls back
 * to {@link SiEventType} so that `inject(SiEventBus)` without a type argument stays typed.
 * `any` resolves to {@link SiEventType} too, as TypeScript infers `SiEventBus<any>` for
 * `inject(SiEventBus)`.
 */
type EventTypeOrDefault<ET> = 0 extends 1 & ET
  ? SiEventType
  : ET extends { name: string; data: unknown }
    ? ET
    : SiEventType;

/**
 * Injectable event bus service for cross-widget communication. It implements
 * {@link SiEventBusApi}, the same interface returned by `getEventBusInstance()`
 * for non-Angular code.
 *
 * By default, uses {@link SiEventType} which provides `filter`, `languageChange`, and `themeChange` events.
 * To use custom events, pass your own event type union as a generic argument:
 *
 * ```ts
 * type MyEvent =
 *   | { name: 'customAction'; data: string }
 *   | { name: 'statusUpdate'; data: boolean };
 *
 * const eventBus = inject(SiEventBus<MyEvent>);
 * eventBus.emit('customAction', 'payload');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
// `in out` makes `ET` invariant. Otherwise `inject(SiEventBus<MyEvent>)` is inferred as
// `SiEventBus<any>` from the class `prototype`, which drops the custom event types.
export class SiEventBus<in out ET> implements SiEventBusApi<EventTypeOrDefault<ET>> {
  private readonly eventBus = createEventBus<EventTypeOrDefault<ET>>();

  /** Emits an event to all subscribers. See {@link SiEventBusApi.emit}. */
  readonly emit: SiEventBusApi<EventTypeOrDefault<ET>>['emit'] = this.eventBus.emit.bind(
    this.eventBus
  );

  /** Subscribes to an event. See {@link SiEventBusApi.on}. */
  readonly on: SiEventBusApi<EventTypeOrDefault<ET>>['on'] = this.eventBus.on.bind(this.eventBus);

  /** Returns the current data of a single event. See {@link SiEventBusApi.snapshot}. */
  readonly snapshot: SiEventBusApi<EventTypeOrDefault<ET>>['snapshot'] =
    this.eventBus.snapshot.bind(this.eventBus);
}

export type { SiEventBusApi, SiEventType };
