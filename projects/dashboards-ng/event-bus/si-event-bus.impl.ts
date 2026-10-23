/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { fromEvent, Observable, Subject } from 'rxjs';

import type {
  EventNameToData,
  NarrowByKeys,
  SiEventBusApi,
  SiEventType
} from './si-event-bus.model';

/**
 * Default implementation of {@link SiEventBusApi}.
 *
 * Intentionally not exported from the entry point. Consumers obtain instances via
 * `getEventBusInstance()` or the Angular `SiEventBus` service and only depend on
 * the {@link SiEventBusApi} interface.
 */
export class SiEventBusImpl<
  ET extends { name: string; data: unknown } = SiEventType
> implements SiEventBusApi<ET> {
  private eventObservables: Map<ET['name'], Subject<any>> = new Map();

  private customEventSuffix = 'θ';

  /**
   * Shared state symbol used as a key on `window` to store the event bus state.
   * A Symbol is used instead of a string key so the property is not discoverable
   * via `Object.keys(window)` or accidental string-based access.
   */
  private static sharedStateSymbol = Symbol.for('eventBusSharedState');

  /**
   * Returns the shared events state object stored on `window`.
   *
   * Widgets running in separate Angular runtimes each get their own event bus
   * instance, so per-instance state would be out of sync. By storing the state on
   * `window`, all instances share a single source of truth.
   *
   * The property is defined with `writable: false` and `configurable: false` so
   * that outside code cannot replace the object, while its own properties remain
   * mutable for internal event state updates.
   */
  private get sharedEventsState(): Record<string, unknown> {
    const win = window as unknown as Record<symbol, unknown>;
    const key = SiEventBusImpl.sharedStateSymbol;
    if (!win[key]) {
      Object.defineProperty(window, key, {
        value: {},
        writable: false,
        enumerable: false,
        configurable: false
      });
    }
    return win[key] as Record<string, unknown>;
  }

  snapshot(): EventNameToData<ET | SiEventType>;
  snapshot<
    R = never,
    A extends keyof EventNameToData<ET | SiEventType> = keyof EventNameToData<ET | SiEventType>,
    K extends string = string
  >(
    eventName: A,
    keys: K[]
  ): [R] extends [never]
    ? NarrowByKeys<EventNameToData<ET | SiEventType>[A], K>
    : NarrowByKeys<R, K>;
  snapshot<A extends keyof EventNameToData<ET | SiEventType>>(
    eventName: A
  ): EventNameToData<ET | SiEventType>[A];
  snapshot<A extends keyof EventNameToData<ET | SiEventType>, K extends string>(
    eventName?: A,
    keys?: K[]
  ):
    | EventNameToData<ET>
    | EventNameToData<ET>[A]
    | NarrowByKeys<EventNameToData<ET>[A], K>
    | undefined {
    const state = this.sharedEventsState as EventNameToData<ET>;

    if (!eventName) {
      return state;
    }

    const data = state[eventName];
    if (!data) {
      return undefined;
    }

    if (keys?.length) {
      const items = Array.isArray(data) ? data : [data];
      return items.filter(f => keys.includes(f.key)) as EventNameToData<ET>[A];
    }

    return data;
  }

  emit<A extends keyof EventNameToData<ET | SiEventType>>(
    eventName: A,
    payload?: EventNameToData<ET | SiEventType>[A]
  ): void {
    this.sharedEventsState[String(eventName)] = payload;
    // We just propagate this as custom event so widgets in other angular runtime contexts can also be notified
    window.dispatchEvent(
      new CustomEvent(`${this.customEventSuffix}${String(eventName)}`, { detail: payload })
    );
  }

  on<
    R = never,
    A extends keyof EventNameToData<ET | SiEventType> = keyof EventNameToData<ET | SiEventType>
  >(eventName: A): Observable<[R] extends [never] ? EventNameToData<ET | SiEventType>[A] : R> {
    if (!this.eventObservables.has(eventName)) {
      const eventSubject = new Subject<
        [R] extends [never] ? EventNameToData<ET | SiEventType>[A] : R
      >();
      this.eventObservables.set(eventName, eventSubject);

      // emit will dispatch a custom event on window, we listen to that and forward to our subject
      fromEvent(window, `${this.customEventSuffix}${String(eventName)}`).subscribe(
        (event: Event) => {
          const customEvent = event as CustomEvent;
          this.eventObservables.get(eventName)!.next(customEvent.detail);
        }
      );

      return eventSubject.asObservable();
    }

    return this.eventObservables.get(eventName)!.asObservable();
  }
}
