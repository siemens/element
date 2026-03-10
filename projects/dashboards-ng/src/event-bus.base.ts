/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Theme } from '@siemens/element-ng/theme';
import { fromEvent, Observable, Subject } from 'rxjs';

export interface EventTypes<Filter = unknown> {
  filter: Filter;
  languageChange: string;
  themeChange: Theme;
  dateRangeChange: { start: Date; end: Date };
  timeZoneChange: string;
}


export class EventBusBase<ET extends EventTypes = EventTypes> {
  private eventObservables: Map<keyof ET, Subject<any>> = new Map();

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

  get currentEventsState(): ET | undefined {
    return this.sharedEventsState as ET;
  }

  emit<K extends keyof ET>(eventType: K, payload?: ET[K]): void {
    this.sharedEventsState[String(eventType)] = payload;
    // We just propagate this as custom event so widgets in other angular runtime contexts can also be notified
    window.dispatchEvent(
      new CustomEvent(`${this.customEventSuffix}${String(eventType)}`, { detail: payload })
    );
  }

  on<K extends keyof ET>(eventType: K): Observable<ET[K]> {
    if (!this.eventObservables.has(eventType)) {
      this.eventObservables.set(eventType, new Subject<ET[K]>());
    }

    // emit will dispatch a custom event on window, we listen to that and forward to our subject
    fromEvent(window, `${this.customEventSuffix}${String(eventType)}`).subscribe((event: Event) => {
      const customEvent = event as CustomEvent;
      this.eventObservables.get(eventType)!.next(customEvent.detail);
    });

    return this.eventObservables.get(eventType)!.asObservable();
  }
}
