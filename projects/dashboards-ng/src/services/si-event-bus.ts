/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { SiEventBusBase, SiEventType } from '@siemens/dashboards-ng/event-bus';

/**
 * Injectable event bus service for cross-widget communication.
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
export class SiEventBus<ET> extends SiEventBusBase<
  ET extends { name: string; data: unknown } ? ET : SiEventType
> {}

export type { SiEventType as SiEventType };
