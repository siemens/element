/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Theme } from '@siemens/element-ng/theme';
import { fromEvent, Observable, Subject } from 'rxjs';

type Filter = { key: any; value: any } | DateRangeChange | TimeZoneChange;
type LanguageChange = string;
type ThemeChange = Theme;
type DateRangeChange = { key: 'dateRange'; value: { start: Date; end: Date } };
type TimeZoneChange = { key: 'timeZone'; value: string };

/**
 * Default event type union used by `EventBus` when no generic parameter is provided.
 * Consumers can override this by passing their own event type union as a generic argument,
 * e.g. `inject(EventBus<MyCustomEventType>)`.
 *
 * The following events are available by default:
 * - `filter` – a single {@link Filter} or an array of filters (including date range and time zone changes)
 * - `languageChange` – the new language as a string
 * - `themeChange` – the new {@link Theme}
 */
export type EventType =
  | { name: 'filter'; data: Filter[] }
  | { name: 'languageChange'; data: LanguageChange }
  | { name: 'themeChange'; data: ThemeChange };

type EventNameToData<ET extends { name: string; data: unknown }> = {
  [K in ET as K['name']]: K['data'];
};

type NarrowByKeys<Data, K extends string> = Data extends (infer U)[] ? (U & { key: K })[] : Data;

export class EventBusBase<ET extends { name: string; data: unknown } = EventType> {
  /**
   * Technically we don't need `keyof ET` here, but it forces TypeScript to
   * preserve the `ET` generic parameter instead of eagerly resolving it.
   */
  private eventObservables: Map<keyof ET | ET['name'], Subject<any>> = new Map();

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
   * Widgets running in separate Angular runtimes each get their own `EventBusBase`
   * instance, so per-instance state would be out of sync. By storing the state on
   * `window`, all instances share a single source of truth.
   *
   * The property is defined with `writable: false` and `configurable: false` so
   * that outside code cannot replace the object, while its own properties remain
   * mutable for internal event state updates.
   */
  private get sharedEventsState(): Record<string, unknown> {
    const win = window as unknown as Record<symbol, unknown>;
    const key = EventBusBase.sharedStateSymbol;
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

  currentEventsState(): EventNameToData<ET>;
  currentEventsState<A extends keyof EventNameToData<ET>, K extends string>(
    eventName: A,
    keys: K[]
  ): NarrowByKeys<EventNameToData<ET>[A], K>;
  currentEventsState<A extends keyof EventNameToData<ET>>(eventName: A): EventNameToData<ET>[A];
  currentEventsState<A extends keyof EventNameToData<ET>, K extends string>(
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

  emit<A extends keyof EventNameToData<ET>>(eventType: A, payload?: EventNameToData<ET>[A]): void {
    this.sharedEventsState[String(eventType)] = payload;
    // We just propagate this as custom event so widgets in other angular runtime contexts can also be notified
    window.dispatchEvent(
      new CustomEvent(`${this.customEventSuffix}${String(eventType)}`, { detail: payload })
    );
  }

  on<R = never, A extends keyof EventNameToData<ET> = keyof EventNameToData<ET>>(
    eventType: A
  ): Observable<[R] extends [never] ? EventNameToData<ET>[A] : R> {
    if (!this.eventObservables.has(eventType)) {
      const eventSubject = new Subject<[R] extends [never] ? EventNameToData<ET>[A] : R>();
      this.eventObservables.set(eventType, eventSubject);

      // emit will dispatch a custom event on window, we listen to that and forward to our subject
      fromEvent(window, `${this.customEventSuffix}${String(eventType)}`).subscribe(
        (event: Event) => {
          const customEvent = event as CustomEvent;
          this.eventObservables.get(eventType)!.next(customEvent.detail);
        }
      );

      return eventSubject.asObservable();
    }

    return this.eventObservables.get(eventType)!.asObservable();
  }
}
