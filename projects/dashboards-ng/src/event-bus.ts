/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import type { Theme } from '@siemens/element-ng/theme';

import { EventBusBase } from './event-bus.base';

export interface EventTypes<Filter = unknown, Export = unknown> {
  filter: Filter;
  export: Export;
  languageChange: string;
  themeChange: Theme;
  dateRangeChange: { start: Date; end: Date };
  timeZoneChange: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventBus<ET extends EventTypes = EventTypes> extends EventBusBase<ET> {}
