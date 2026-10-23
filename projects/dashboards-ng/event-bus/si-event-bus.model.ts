/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Theme } from '@siemens/element-ng/theme';
import type { Observable } from 'rxjs';

type Filter = { key: unknown; value: unknown } | DateRangeChange | TimeZoneChange;
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
export type SiEventType =
  | { name: 'filter'; data: Filter[] }
  | { name: 'languageChange'; data: LanguageChange }
  | { name: 'themeChange'; data: ThemeChange };

/**
 * Converts the union {@link SiEventType} into an object type with event names as keys
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
export type EventNameToData<ET extends { name: string; data: unknown }> = {
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
export type NarrowByKeys<Data, K extends string> = Data extends (infer U)[]
  ? (U & { key: K; value: unknown })[]
  : Data;

/**
 * Public API of the event bus used for cross-widget communication.
 *
 * It is implemented by the Angular `SiEventBus` service and returned by
 * `getEventBusInstance()` for non-Angular code, so code shared between both
 * can depend on this interface instead of a concrete implementation.
 *
 * @typeParam ET - Union of custom event types. The default {@link SiEventType}
 *   events are always available in addition to the custom ones.
 */
export interface SiEventBusApi<ET extends { name: string; data: unknown } = SiEventType> {
  /**
   * Returns a point-in-time snapshot of the current event bus state.
   *
   * @returns The full state object when called without arguments.
   * @param eventName - Optional event name to retrieve data for a single event.
   * @param keys - Optional array of keys to narrow array-typed event data
   *   (e.g. filter items) to only those matching the given keys.
   *   A custom return type `R` can be provided to override the inferred
   *   payload type when keys are passed.
   *
   * @example
   * ```ts
   * // With a custom return type override
   * eventBus.snapshot<{key: string; value: boolean}[]>('filter', ['processed', 'sent']);
   * // => {key: 'processed' | 'sent', value: boolean}[]
   * ```
   */
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

  /**
   * Emits an event, updating the shared state so that all observables
   * returned by {@link SiEventBusApi.on} for the same event type receive the new value.
   *
   * @param eventName - The name of the event to emit.
   * @param payload - The data associated with the event.
   */
  emit<A extends keyof EventNameToData<ET | SiEventType>>(
    eventName: A,
    payload?: EventNameToData<ET | SiEventType>[A]
  ): void;

  /**
   * Subscribes to an event and returns an observable that emits whenever
   * {@link SiEventBusApi.emit} is called with the matching event name.
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
    A extends keyof EventNameToData<ET | SiEventType> = keyof EventNameToData<ET | SiEventType>
  >(
    eventName: A
  ): Observable<[R] extends [never] ? EventNameToData<ET | SiEventType>[A] : R>;
}
