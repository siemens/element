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
 * Default event type union used by `SiEventBus` when no generic parameter is provided.
 * Consumers can override this by passing their own event type union as a generic argument,
 * e.g. `inject(SiEventBus<MyCustomEventType>)`.
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

/**
 * Converts the union {@link EventType} into an object type with event names as keys
 * and data types as values.
 *
 * @example
 * ```ts
 * Input union:
 *   | { name: 'filter'; data: Filter[] }
 *   | { name: 'languageChange'; data: LanguageChange }
 *   | { name: 'themeChange'; data: ThemeChange }
 *
 * Output object type:
 *   { filter: Filter[]; languageChange: LanguageChange; themeChange: ThemeChange }
 * ```
 */
type EventNameToData<ET extends { name: string; data: unknown }> = {
  [K in ET as K['name']]: K['data'];
};

/**
 * Narrows array-typed event data to only include items whose `key` property
 * matches one of the given keys. If `Data` is not an array, it is returned as-is.
 *
 * @typeParam Data - The event data type to narrow.
 * @typeParam K - The string literal union of keys to filter by.
 *
 * @example
 * ```ts
 * NarrowByKeys<Filter[], 'dateRange'>
 * // => (Filter & { key: 'dateRange' })[]
 *
 * NarrowByKeys<string, 'dateRange'>
 * // => string  (unchanged, not an array)
 * ```
 */
type NarrowByKeys<Data, K extends string> = Data extends (infer U)[] ? (U & { key: K })[] : Data;

export class SiEventBusBase<ET extends { name: string; data: unknown } = EventType> {
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
   * Widgets running in separate Angular runtimes each get their own `SiEventBusBase`
   * instance, so per-instance state would be out of sync. By storing the state on
   * `window`, all instances share a single source of truth.
   *
   * The property is defined with `writable: false` and `configurable: false` so
   * that outside code cannot replace the object, while its own properties remain
   * mutable for internal event state updates.
   */
  private get sharedEventsState(): Record<string, unknown> {
    const win = window as unknown as Record<symbol, unknown>;
    const key = SiEventBusBase.sharedStateSymbol;
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

  /**
   * Returns a point-in-time snapshot of the current event bus state.
   *
   * @returns The full state object when called without arguments.
   * @param eventName - Optional event name to retrieve data for a single event.
   * @param keys - Optional array of keys to narrow array-typed event data
   *   (e.g. filter items) to only those matching the given keys.
   */
  snapshot(): EventNameToData<ET | EventType>;
  snapshot<A extends keyof EventNameToData<ET | EventType>, K extends string>(
    eventName: A,
    keys: K[]
  ): NarrowByKeys<EventNameToData<ET | EventType>[A], K>;
  snapshot<A extends keyof EventNameToData<ET | EventType>>(
    eventName: A
  ): EventNameToData<ET | EventType>[A];
  snapshot<A extends keyof EventNameToData<ET | EventType>, K extends string>(
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

  /**
   * Emits an event, updating the shared state so that all observables
   * returned by {@link on} for the same event type receive the new value.
   *
   * @param eventName - The name of the event to emit.
   * @param payload - The data associated with the event.
   */
  emit<A extends keyof EventNameToData<ET | EventType>>(
    eventName: A,
    payload?: EventNameToData<ET | EventType>[A]
  ): void {
    this.sharedEventsState[String(eventName)] = payload;
    // We just propagate this as custom event so widgets in other angular runtime contexts can also be notified
    window.dispatchEvent(
      new CustomEvent(`${this.customEventSuffix}${String(eventName)}`, { detail: payload })
    );
  }

  /**
   * Subscribes to an event and returns an observable that emits whenever
   * {@link emit} is called with the matching event name.
   *
   * @param eventName - The name of the event to listen for.
   * @returns An observable of the event payload. A custom return type `R` can
   *   be provided to override the inferred payload type.
   *
   * @example
   * ```ts
   * eventBus.on('themeChange').subscribe(theme => {
   *   console.log('Theme changed to', theme);
   * });
   *
   * // With a custom return type override
   * eventBus.on<MyCustomType>('filter').subscribe(data => {
   *   // data is typed as MyCustomType
   * });
   * ```
   */
  on<
    R = never,
    A extends keyof EventNameToData<ET | EventType> = keyof EventNameToData<ET | EventType>
  >(eventName: A): Observable<[R] extends [never] ? EventNameToData<ET | EventType>[A] : R> {
    if (!this.eventObservables.has(eventName)) {
      const eventSubject = new Subject<
        [R] extends [never] ? EventNameToData<ET | EventType>[A] : R
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
