/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  isAfter,
  isAfterMonth,
  isAfterYear,
  isBetween,
  isBetweenMonth,
  isBetweenYears,
  isSameDate,
  isSameMonth,
  isSameOrBefore,
  isSameOrBeforeMonth,
  isSameOrBeforeYear,
  isSameOrBetween,
  isSameOrBetweenMonth,
  isSameOrBetweenYears,
  isSameYear
} from '../date-time-helper';

/**
 * Compare the dates based on the active view.
 */
export interface CompareAdapter {
  isAfter(current: Date, start: Date): boolean;
  isBetween(current: Date, from?: Date, to?: Date): boolean;
  isEqual(current: Date, other?: Date): boolean;
  isEqualOrBefore(current: Date, other: Date): boolean;
  isEqualOrBetween(current: Date, from?: Date, to?: Date): boolean;
}

/**
 * Compare dates in the month view.
 */
export class DayCompareAdapter implements CompareAdapter {
  isAfter(current: Date, start: Date): boolean {
    return isAfter(current, start);
  }

  isBetween(current: Date, from?: Date | undefined, to?: Date | undefined): boolean {
    return isBetween(current, from, to);
  }

  isEqual(current: Date, other: Date): boolean {
    return isSameDate(current, other);
  }

  isEqualOrBefore(current: Date, other: Date): boolean {
    return isSameOrBefore(current, other);
  }

  isEqualOrBetween(current: Date, from?: Date, to?: Date): boolean {
    return isSameOrBetween(current, from, to);
  }
}

/**
 * Compare dates in the year view.
 */
export class MonthCompareAdapter implements CompareAdapter {
  isAfter(current: Date, start: Date): boolean {
    return isAfterMonth(current, start);
  }

  isBetween(current: Date, from?: Date | undefined, to?: Date | undefined): boolean {
    return isBetweenMonth(current, from, to);
  }

  isEqual(current: Date, other: Date): boolean {
    return isSameMonth(current, other);
  }

  isEqualOrBefore(current: Date, other: Date): boolean {
    return isSameOrBeforeMonth(current, other);
  }

  isEqualOrBetween(current: Date, from?: Date, to?: Date): boolean {
    return isSameOrBetweenMonth(current, from, to);
  }
}

export class YearCompareAdapter implements CompareAdapter {
  isAfter(current: Date, other: Date): boolean {
    return isAfterYear(current, other);
  }

  isBetween(current: Date, from?: Date | undefined, to?: Date | undefined): boolean {
    return isBetweenYears(current, from, to);
  }

  isEqual(current: Date, other: Date): boolean {
    return isSameYear(current, other);
  }

  isEqualOrBefore(current: Date, other?: Date): boolean {
    if (!other) {
      return false;
    }
    return isSameOrBeforeYear(current, other);
  }

  isEqualOrBetween(current: Date, from?: Date, to?: Date): boolean {
    return isSameOrBetweenYears(current, from, to);
  }
}
