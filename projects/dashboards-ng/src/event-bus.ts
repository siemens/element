/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';

import { EventBusBase, EventType } from './event-bus.base';


@Injectable({
  providedIn: 'root'
})
export class EventBus<ET extends {name: string; data: unknown} = EventType> extends EventBusBase<ET> {}

export type { EventType };
