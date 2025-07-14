/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { formatDate } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { SiDateRangeCalculationService } from './si-date-range-calculation.service';
import { DateRangeFilter } from './si-date-range-filter.types';

const ONE_DAY = 1000 * 60 * 60 * 24;

describe('SiDateRangeCalculationService', () => {
  let service!: SiDateRangeCalculationService;

  // to avoid intermittent failures due to different milliseconds
  const compareDates = (d1: Date, d2: Date): void =>
    expect(formatDate(d1, 'dateShort', 'en')).toEqual(formatDate(d2, 'dateShort', 'en'));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SiDateRangeCalculationService] });
    service = TestBed.inject(SiDateRangeCalculationService);
  });

  it('resolves with before', () => {
    const filter: DateRangeFilter = {
      point1: new Date('2023-07-15'),
      point2: ONE_DAY * 7,
      range: 'before'
    };

    const resolved = service.resolveDateRangeFilter(filter);
    expect(resolved.valid).toBeTrue();
    compareDates(resolved.start, new Date('2023-07-08'));
    compareDates(resolved.end, new Date('2023-07-15'));
  });

  it('resolves with before and now as reference', () => {
    const filter: DateRangeFilter = {
      point1: 'now',
      point2: ONE_DAY * 7
    };

    const end = new Date();
    const start = new Date(end.getTime() - 7 * ONE_DAY);

    const resolved = service.resolveDateRangeFilter(filter);
    expect(resolved.valid).toBeTrue();
    compareDates(resolved.start, start);
    compareDates(resolved.end, end);
  });

  it('resolves with date and now as reference', () => {
    const filter: DateRangeFilter = {
      point1: 'now',
      point2: new Date('2023-05-07')
    };

    const end = new Date();
    const start = new Date('2023-05-07');

    const resolved = service.resolveDateRangeFilter(filter);
    expect(resolved.valid).toBeTrue();
    compareDates(resolved.start, start);
    compareDates(resolved.end, end);
  });

  it('resolves with after', () => {
    const filter: DateRangeFilter = {
      point1: new Date('2023-07-15'),
      point2: ONE_DAY * 7,
      range: 'after'
    };

    const resolved = service.resolveDateRangeFilter(filter);
    expect(resolved.valid).toBeTrue();
    compareDates(resolved.start, new Date('2023-07-15'));
    compareDates(resolved.end, new Date('2023-07-22'));
  });

  it('resolves with within', () => {
    const filter: DateRangeFilter = {
      point1: new Date('2023-07-15'),
      point2: ONE_DAY * 7,
      range: 'within'
    };

    const resolved = service.resolveDateRangeFilter(filter);
    expect(resolved.valid).toBeTrue();
    compareDates(resolved.start, new Date('2023-07-08'));
    compareDates(resolved.end, new Date('2023-07-22'));
  });

  it('resolves with two dates', () => {
    const filter: DateRangeFilter = {
      point1: new Date('2023-06-17'),
      point2: new Date('2023-07-15')
    };

    const resolved = service.resolveDateRangeFilter(filter);
    expect(resolved.valid).toBeTrue();
    compareDates(resolved.start, new Date('2023-06-17'));
    compareDates(resolved.end, new Date('2023-07-15'));
  });
});
