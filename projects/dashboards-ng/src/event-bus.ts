/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';

import { EventBusBase, EventType } from './event-bus.base';

@Injectable({
  providedIn: 'root'
})
/**
 * Injectable event bus service for cross-widget communication.
 *
 * By default, uses {@link EventType} which provides `filter`, `languageChange`, and `themeChange` events.
 * To use custom events, pass your own event type union as a generic argument:
 *
 * ```ts
 * type MyEvent =
 *   | { name: 'customAction'; data: string }
 *   | { name: 'statusUpdate'; data: boolean };
 *
 * const eventBus = inject(EventBus<MyEvent>);
 * eventBus.emit('customAction', 'payload');
 * ```
 */
export class EventBus<ET> extends EventBusBase<
  ET extends { name: string; data: unknown } ? ET : EventType
> {}

export type { EventType };
