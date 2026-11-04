/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { EMPTY, filter, fromEvent, map, Observable, share } from 'rxjs';

import type {
  SiEmitOptions,
  SiEvent,
  SiEventBusApi,
  SiEventPattern,
  SiEventType,
  SiEventTypeOf,
  SiResolvedEventMap
} from './si-event-bus.model';

/** Name of the `window` event carrying every event bus event in its `detail`. */
const CHANNEL = 'si-event-bus';

/** Key on `window` of the object holding the latest event per type. */
const STATE_KEY = Symbol.for('si-event-bus');

let idCounter = 0;

// `crypto.randomUUID()` is only available in secure contexts (HTTPS or localhost).
const createId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const matches = (pattern: string, type: string): boolean =>
  pattern === '*' ||
  pattern === type ||
  (pattern.endsWith('.*') && type.startsWith(pattern.slice(0, -1)));

/**
 * Default implementation of {@link SiEventBusApi}.
 *
 * Intentionally not exported from the entry point. Consumers obtain instances via
 * `getEventBusInstance()` or the Angular `SiEventBus` service.
 * Without `window` (e.g. during SSR), `emit` does nothing, `on` returns `EMPTY` and
 * `snapshot` returns `undefined`.
 */
export class SiEventBusImpl implements SiEventBusApi {
  private readonly events: Observable<SiEvent>;

  constructor(
    private readonly source = '/',
    private readonly win: Window | null = globalThis.window ?? null
  ) {
    this.events = win
      ? fromEvent<CustomEvent<SiEvent>>(win, CHANNEL).pipe(
          map(event => event.detail),
          share()
        )
      : EMPTY;
  }

  /** Latest event per type, shared by all instances through `window`. */
  private get state(): Record<string, SiEvent | undefined> {
    const win = this.win as unknown as Record<symbol, Record<string, SiEvent | undefined>>;
    if (!win[STATE_KEY]) {
      Object.defineProperty(win, STATE_KEY, {
        value: Object.create(null),
        writable: false,
        enumerable: false,
        configurable: false
      });
    }
    return win[STATE_KEY];
  }

  emit<T extends SiEventType>(type: T, data: SiResolvedEventMap[T], options?: SiEmitOptions): void;
  emit(events: Partial<SiResolvedEventMap>, options?: SiEmitOptions): void;
  emit(
    typeOrEvents: SiEventType | Partial<SiResolvedEventMap>,
    dataOrOptions?: unknown,
    options?: SiEmitOptions
  ): void {
    const isBatch = typeof typeOrEvents !== 'string';
    const entries: [string, unknown][] = isBatch
      ? Object.entries(typeOrEvents).filter(([, data]) => data !== undefined)
      : [[typeOrEvents, dataOrOptions]];
    const emitOptions = (isBatch ? dataOrOptions : options) as SiEmitOptions | undefined;

    const wildcard = entries.find(([type]) => type.includes('*'));
    if (wildcard) {
      throw new Error(`SiEventBus: event type must not contain a wildcard, got '${wildcard[0]}'.`);
    }
    if (!this.win) {
      return;
    }

    const events = entries.map(
      ([type, data]) =>
        Object.freeze({
          specversion: '1.0',
          id: createId(),
          type,
          source: emitOptions?.source ?? this.source,
          time: new Date().toISOString(),
          ...(emitOptions?.subject !== undefined && { subject: emitOptions.subject }),
          data
        }) as SiEvent
    );
    // Store all events before delivering any, so subscribers see a consistent state.
    for (const event of events) {
      this.state[event.type] = event;
    }
    for (const event of events) {
      this.win.dispatchEvent(new CustomEvent(CHANNEL, { detail: event }));
    }
  }

  on<P extends SiEventPattern>(pattern: P | readonly P[]): Observable<SiEvent<SiEventTypeOf<P>>> {
    const patterns: readonly string[] = typeof pattern === 'string' ? [pattern] : pattern;
    return this.events.pipe(
      filter(event => patterns.some(p => matches(p, event.type)))
    ) as Observable<SiEvent<SiEventTypeOf<P>>>;
  }

  snapshot<T extends SiEventType>(type: T): SiEvent<T> | undefined {
    return this.win ? (this.state[type] as SiEvent<T> | undefined) : undefined;
  }
}
