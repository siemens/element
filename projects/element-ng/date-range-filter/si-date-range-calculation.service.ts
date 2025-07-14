/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';

import { DateRangeFilter, ResolvedDateRange } from './si-date-range-filter.types';

export interface ResolveDateRangeOptions {
  /**
   * Resolve time? When set to false, hours/minutes/seconds/ms are set to zero
   * @defaultValue true
   **/
  withTime?: boolean;
  /**
   * Skip normalization? When skipped, `point1` will always be `start`, `point2` will be `end`
   */
  skipNormalization?: boolean;
}

/**
 * Service to transform and calculate with DateRangeFilter objects.
 */
@Injectable({ providedIn: 'root' })
export class SiDateRangeCalculationService {
  /**
   * Calculates the start and end dates of a DateRangeFilter.
   * @param filter - The date range filter object to be resolved.
   * @param options - Options for time handling
   * @returns The resolved result in form of a ResolvedDateRange object.
   */
  resolveDateRangeFilter(
    filter: DateRangeFilter,
    options?: ResolveDateRangeOptions
  ): ResolvedDateRange {
    const ref = filter.point1 === 'now' ? new Date() : new Date(filter.point1);
    const withTime = options?.withTime ?? true;

    if (!withTime) {
      this.removeTime(ref);
    }

    if (filter.point2 instanceof Date) {
      const point2 = withTime ? filter.point2 : this.removeTime(new Date(filter.point2));
      return this.normalize(ref, point2, options?.skipNormalization);
    }

    const offset = filter.point2;

    switch (filter.range) {
      case undefined:
      case 'before':
        return this.normalize(ref, this.datePlusOffset(ref, -offset), options?.skipNormalization);
      case 'after':
        return this.normalize(ref, this.datePlusOffset(ref, offset), options?.skipNormalization);
      case 'within':
        return this.normalize(
          this.datePlusOffset(ref, -offset),
          this.datePlusOffset(ref, offset),
          options?.skipNormalization
        );
    }
  }

  private datePlusOffset(date: Date, offset: number): Date {
    return new Date(date.getTime() + offset);
  }

  private normalize(date1: Date, date2: Date, skip?: boolean): ResolvedDateRange {
    const valid = !isNaN(date1.getTime()) && !isNaN(date2.getTime());
    return skip
      ? { start: date1, end: date2, valid }
      : date1 < date2
        ? { start: date1, end: date2, valid }
        : { start: date2, end: date1, valid };
  }

  /**
   * Utility to reset the time attributes to 0 (hours/minutes/seconds/milliseconds).
   */
  removeTime(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
}
