/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Theme } from '@siemens/element-ng/theme';
import { fromEvent, Observable, Subject } from 'rxjs';

type Filter = {key: any; value: any};
type LanguageChange = string;
type ThemeChange = Theme;
type DateRangeChange = { start: Date; end: Date };
type TimeZoneChange = string;

export type EventType =
  | {name: 'filter'; data: Filter | Filter[]}
  | {name: 'languageChange'; data: LanguageChange}
  | {name: 'themeChange'; data: ThemeChange}
  | {name: 'dateRangeChange'; data: DateRangeChange}
  | {name: 'timeZoneChange'; data: TimeZoneChange};

export class EventBusBase<ET extends {name: string; data: unknown} = EventType> {
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
        configurable: false,
      });
    }
    return win[key] as Record<string, unknown>;
  }

  get currentEventsState(): { [K in ET as K['name']]: K['data'] } | undefined {
    return this.sharedEventsState as { [K in ET as K['name']]: K['data'] };
  }

  emit<A extends keyof { [K in ET as K['name']]: K['data'] }>(eventType: A, payload?: { [K in ET as K['name']]: K['data'] }[A]): void {
    this.sharedEventsState[String(eventType)] = payload;
    // We just propagate this as custom event so widgets in other angular runtime contexts can also be notified
    window.dispatchEvent(
      new CustomEvent(`${this.customEventSuffix}${String(eventType)}`, { detail: payload })
    );
  }

  on<A extends keyof { [K in ET as K['name']]: K['data'] }>(eventType: A): Observable<{ [K in ET as K['name']]: K['data'] }[A]> {
    if (!this.eventObservables.has(eventType)) {
      this.eventObservables.set(eventType, new Subject());
    }

    // emit will dispatch a custom event on window, we listen to that and forward to our subject
    fromEvent(window, `${this.customEventSuffix}${String(eventType)}`).subscribe((event: Event) => {
      const customEvent = event as CustomEvent;
      this.eventObservables.get(eventType)!.next(customEvent.detail);
    });

    return this.eventObservables.get(eventType)!.asObservable();
  }
}
