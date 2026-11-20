/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Theme } from '@siemens/element-ng/theme';
import type { Observable } from 'rxjs';

/**
 * Built-in events of the event bus, mapping each event type to its data type.
 *
 * Do not augment this interface. To add events or to override the data type of a
 * built-in event, augment {@link SiEventMap} instead.
 */
/* eslint-disable @typescript-eslint/naming-convention */
export interface SiDefaultEventMap {
  /** Selected date range. `null` clears the filter. */
  'filter.dateRange': { start: Date; end: Date } | null;
  /** Selected IANA time zone, e.g. `Europe/Berlin`. `null` clears the filter. */
  'filter.timeZone': string | null;
  /** Selected location. The shape is application specific, override it in {@link SiEventMap}. */
  'filter.location': unknown;
  /** Active theme. */
  'app.theme': Theme;
  /** Active language as BCP 47 code, e.g. `de`. */
  'app.language': string;
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Application events of the event bus, mapping each event type to its data type.
 * Empty by default, extend it via module augmentation to register custom events or
 * to override the data type of a built-in event from {@link SiDefaultEventMap}.
 *
 * Each build only needs to declare the events it uses itself. Builds sharing an event
 * (e.g. separately built web components) must agree on its data type.
 *
 * @example
 * ```ts
 * declare module '@siemens/dashboards-ng/event-bus' {
 *   interface SiEventMap {
 *     'filter.severity': 'low' | 'high' | null;            // new filter
 *     'acme.order.selected': { orderId: string };          // new event
 *     'filter.location': { id: string; path: string[] };   // overrides built-in type
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended via module augmentation
export interface SiEventMap {}

/** All events known to the event bus: {@link SiDefaultEventMap} overridden by {@link SiEventMap}. */
export type SiResolvedEventMap = Omit<SiDefaultEventMap, keyof SiEventMap> & SiEventMap;

/** Union of all registered event types, e.g. `'filter.dateRange' | 'app.theme' | ...`. */
export type SiEventType = keyof SiResolvedEventMap & string;

/**
 * An event as delivered by the event bus, following the
 * [CloudEvents 1.0](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md) structure.
 * Events are frozen and must not be modified.
 *
 * For a union of types, this is a union of events, so it can be narrowed by `switch (event.type)`.
 */
export type SiEvent<T extends SiEventType = SiEventType> = T extends SiEventType
  ? {
      /** CloudEvents specification version. */
      readonly specversion: '1.0';
      /** Unique id of this event. */
      readonly id: string;
      /** Event type, e.g. `filter.dateRange`. */
      readonly type: T;
      /** Emitter of the event, e.g. `/widgets/my-widget`. Defaults to `/`. */
      readonly source: string;
      /** Time of the emit as ISO 8601 string. */
      readonly time: string;
      /** Optional subject of the event within the context of the source. */
      readonly subject?: string;
      /** Event data. */
      readonly data: SiResolvedEventMap[T];
    }
  : never;

type Prefixes<T extends string> = T extends `${infer Head}.${infer Rest}`
  ? Head | `${Head}.${Prefixes<Rest>}`
  : never;

/**
 * Pattern accepted by {@link SiEventBusApi.on}: an event type (`filter.dateRange`),
 * a prefix wildcard matching all types below that prefix at any depth (`filter.*`),
 * or `*` for all events.
 */
export type SiEventPattern = SiEventType | `${Prefixes<SiEventType>}.*` | '*';

/** Resolves a {@link SiEventPattern} to the event types it matches. */
export type SiEventTypeOf<P extends SiEventPattern> = P extends '*'
  ? SiEventType
  : P extends `${infer Prefix}.*`
    ? Extract<SiEventType, `${Prefix}.${string}`>
    : Extract<P, SiEventType>;

/** Options of {@link SiEventBusApi.emit}. */
export interface SiEmitOptions {
  /** Overrides the default source of the event bus for this event. */
  source?: string;
  /** Subject of the event within the context of the source. */
  subject?: string;
}

/** Options of `getEventBusInstance()`. */
export interface SiEventBusOptions {
  /** Default source of emitted events. Defaults to `/`. */
  source?: string;
}

/**
 * Public API of the event bus used for cross-widget communication.
 *
 * Implemented by the Angular `SiEventBus` service and returned by `getEventBusInstance()`
 * for non-Angular code. All instances share their events and state through `window`.
 */
export interface SiEventBusApi {
  /**
   * Emits an event to all subscribers and stores it as the latest event of its type.
   * Every call creates a new event, also if the data did not change.
   *
   * @param type - The event type. Must not contain `*`.
   * @param data - The event data. Emit `null` to clear a filter.
   * @param options - Optional `source` and `subject` of the event.
   *
   * @example
   * ```ts
   * eventBus.emit('filter.timeZone', 'Europe/Berlin', { source: '/widgets/time-zone-picker' });
   * ```
   */
  emit<T extends SiEventType>(type: T, data: SiResolvedEventMap[T], options?: SiEmitOptions): void;

  /**
   * Emits multiple events at once, one event per given type. All events are stored
   * before any of them is delivered, so subscribers see the new data of all types
   * via {@link SiEventBusApi.snapshot}. Types with an `undefined` value are ignored.
   *
   * @param events - Object mapping event types to their data.
   * @param options - Optional `source` and `subject`, applied to all events.
   *
   * @example
   * ```ts
   * eventBus.emit({ 'filter.timeZone': 'UTC', 'filter.dateRange': null });
   * ```
   */
  emit(events: Partial<SiResolvedEventMap>, options?: SiEmitOptions): void;

  /**
   * Subscribes to all events matching the given pattern(s). Only events emitted after
   * subscribing are delivered, use {@link SiEventBusApi.snapshot} to read the latest event.
   *
   * At runtime, `*` also delivers events of types not registered in the current build.
   *
   * @param pattern - An event type, a prefix wildcard (`filter.*`), `*`, or an array of these.
   *
   * @example
   * ```ts
   * eventBus.on(['filter.*', 'app.theme']).subscribe(event => {
   *   switch (event.type) {
   *     case 'filter.dateRange': // event.data is { start: Date; end: Date } | null
   *     case 'app.theme': // event.data is Theme
   *   }
   * });
   * ```
   */
  on<P extends SiEventPattern>(pattern: P | readonly P[]): Observable<SiEvent<SiEventTypeOf<P>>>;

  /**
   * Returns the latest event of the given type or `undefined` if it was never emitted.
   *
   * @param type - The event type.
   */
  snapshot<T extends SiEventType>(type: T): SiEvent<T> | undefined;
}
