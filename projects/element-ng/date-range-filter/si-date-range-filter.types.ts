/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Simple DateRangeFilter preset based on offset from now
 */
export interface DateRangePresetOffset {
  type?: 'offset';
  /** translation key for label */
  label: TranslatableString;
  /** offset from current in milliseconds */
  offset: number;
}

/**
 * Advanced DateRageFilter preset with custom calculation
 */
export interface DateRangePresetCustom {
  type: 'custom';
  /** translation key for label */
  label: TranslatableString;
  /** calculation custom calculation function */
  calculate: (self: DateRangePresetCustom, currentRange: DateRangeFilter) => DateRangeFilter;
  /** Whether this should show only when time support is enabled */
  timeOnly?: boolean;
}

export type DateRangePreset = DateRangePresetOffset | DateRangePresetCustom;

export interface DateRangeFilter {
  point1: Date | 'now';
  point2: number | Date;
  range?: 'before' | 'after' | 'within';
}

export interface ResolvedDateRange {
  start: Date;
  end: Date;
  valid: boolean;
}

export const ONE_MINUTE = 60 * 1000;
export const ONE_DAY = ONE_MINUTE * 60 * 24;
