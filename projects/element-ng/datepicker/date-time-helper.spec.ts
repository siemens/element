/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import {
  addDays,
  addDaysInRange,
  addMonthsInRange,
  getDateSameOrBetween,
  getNamedFormat,
  getWeekEndDate,
  getWeekStartDate,
  isSameDate,
  parseDate,
  today
} from './date-time-helper';

const SUNDAY = 0;
const FRIDAY = 5;
const SATURDAY = 6;

describe('date time helper', () => {
  let dtPipe: DatePipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatePipe]
    });
    dtPipe = TestBed.inject(DatePipe);
  });

  it('should correctly get custom format', () => {
    const format = getNamedFormat('en', 'short');
    expect(format).toEqual('M/d/yy, h:mm a');
  });

  it('should correctly get custom format with mediumTime', () => {
    const format = getNamedFormat('en', 'medium');
    expect(format).toEqual('M/d/yy, h:mm:ss a');
  });

  it('should correctly parse date time', () => {
    const currentDate = new Date('2020-08-28T14:30:00.000Z');
    const date = dtPipe.transform(currentDate, 'shortDate');
    const time = dtPipe.transform(currentDate, 'shortTime');
    const dateTime = date + ' ' + time;

    const format = getNamedFormat('en', 'short');
    const parsedValue = parseDate(dateTime, format, 'en');
    expect(parsedValue).not.toBeUndefined();
    expect(new Date(currentDate)).toEqual(parsedValue!);
  });

  it('should not process invalid date time', () => {
    const currentDate = new Date('2020-08-28T00:00:00.000Z');
    const date = dtPipe.transform(currentDate, 'shortDate');
    const time = dtPipe.transform(currentDate, 'shortTime');
    const dateTime = date + 'abc' + time;

    const format = getNamedFormat('en', 'short');
    const parsedValue = parseDate(dateTime, format, 'en');
    expect(parsedValue?.getTime()).toBeNaN();
  });

  it('should convert a pure date string to a users timezone', () => {
    const dateString = '04/05/2020';
    const parsedDate = parseDate(dateString, 'M/d/yyyy', 'en');

    expect(parsedDate).toEqual(new Date(dateString));
  });

  it('should parse a two-digit year', () => {
    expect(parseDate('6/4/21', 'dd/MM/yyyy', 'en')).toEqual(new Date('2021-04-06T00:00'));
    expect(parseDate('7/5/98', 'dd/MM/yyyy', 'en')).toEqual(new Date('1998-05-07T00:00'));
  });

  describe('addDays', () => {
    const year = 2020;
    it('leap year - should switch from 01th march to 29th feb', () => {
      const input = new Date(Date.UTC(year, 2, 1));
      const actual = addDays(input, -1);
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(29);
      expect(actual.getMonth()).toBe(1);
      expect(actual.getFullYear()).toBe(year);
    });

    it('negativ one should switch to previous year', () => {
      const input = new Date(Date.UTC(year, 0, 1));
      const actual = addDays(input, -1);
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(31);
      expect(actual.getMonth()).toBe(11);
      expect(actual.getFullYear()).toBe(year - 1);
    });

    it('negativ seven should switch to previous month', () => {
      const input = new Date(Date.UTC(year, 1, 1));
      const actual = addDays(input, -7);
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(25);
      expect(actual.getMonth()).toBe(0);
      expect(actual.getFullYear()).toBe(year);
    });

    it('negativ seven should switch to previous year', () => {
      const input = new Date(Date.UTC(year, 0, 5));
      const actual = addDays(input, -7);
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(29);
      expect(actual.getMonth()).toBe(11);
      expect(actual.getFullYear()).toBe(year - 1);
    });

    it('should not be the same object', () => {
      const input = new Date(Date.UTC(year, 0, 5));
      const actual = addDays(input, 0);
      expect(isSameDate(input, actual)).toBeTrue();
    });
  });

  describe('addDaysInRange', () => {
    const year = 2023;
    const month = 11;
    const day = 5;
    const input = new Date(Date.UTC(year, month, day));
    it('undefined range shall be ignored', () => {
      const actual = addDaysInRange(input, -7);
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(28);
      expect(actual.getMonth()).toBe(10);
      expect(actual.getFullYear()).toBe(year);
    });

    it('min range shall be considered', () => {
      const actual = addDaysInRange(input, -1, new Date(Date.UTC(year, month, day - 1)));
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(day - 1);
      expect(actual.getMonth()).toBe(month);
      expect(actual.getFullYear()).toBe(year);
    });

    it('out of range shall return current value', () => {
      const minDate = new Date(Date.UTC(year, month, day));
      const actual = addDaysInRange(input, -1, minDate);
      expect(actual.getDate()).toBe(day);
      expect(actual.getMonth()).toBe(month);
      expect(actual.getFullYear()).toBe(year);
    });

    it('max range shall be considered', () => {
      const actual = addDaysInRange(input, 1, undefined, new Date(Date.UTC(year, month, day + 1)));
      expect(actual).not.toEqual(input);
      expect(actual.getDate()).toBe(day + 1);
      expect(actual.getMonth()).toBe(month);
      expect(actual.getFullYear()).toBe(year);
    });
  });

  describe('getWeekStartDate', () => {
    const year = 2023;
    const march = 2;
    const day = 30;
    // March 2023
    // Su Mo Tu We Th Fr Sa So
    // 26 27 28 29 30 31 01 02
    const input = new Date(year, march, day);

    it('should not change input date', () => {
      getWeekStartDate(input, 'monday');
      expect(input.getDate()).toBe(day);
      expect(input.getMonth()).toBe(march);
      expect(input.getFullYear()).toBe(year);
    });

    it('should create new Date', () => {
      const actual = getWeekStartDate(input, 'monday');

      expect(input == actual).not.toBeTrue();
    });

    it('should be monday', () => {
      const actual = getWeekStartDate(input, 'monday');
      expect(actual.getDay()).toBe(1);
    });

    it('should be sunday', () => {
      const actual = getWeekStartDate(input, 'sunday');
      expect(actual.getDay()).toBe(SUNDAY);
    });

    it('should be sunday', () => {
      const actual = getWeekStartDate(input, 'saturday');
      expect(actual.getDay()).toBe(SATURDAY);
    });
  });

  describe('getWeekEndDate', () => {
    const year = 2023;
    const march = 2;
    const day = 30;
    // March 2023
    // Su Mo Tu We Th Fr Sa So
    // 26 27 28 29 30 31 01 02
    const input = new Date(year, march, day);

    it('should not change input date', () => {
      getWeekEndDate(input, 'monday');
      expect(input.getDate()).toBe(day);
      expect(input.getMonth()).toBe(march);
      expect(input.getFullYear()).toBe(year);
    });

    it('should create new Date', () => {
      const actual = getWeekEndDate(input, 'monday');

      expect(input == actual).not.toBeTrue();
    });

    it('should be sunday', () => {
      const actual = getWeekEndDate(input, 'monday');
      expect(actual.getDay()).toBe(SUNDAY);
    });

    it('should be saturday', () => {
      const actual = getWeekEndDate(input, 'sunday');
      expect(actual.getDay()).toBe(SATURDAY);
    });

    it('should be friday', () => {
      const actual = getWeekEndDate(input, 'saturday');
      expect(actual.getDay()).toBe(FRIDAY);
    });
  });

  describe('getDateSameOrBetween', () => {
    const input = today();
    describe('should result in current date', () => {
      it('when no range is specified', () => {
        const actual = getDateSameOrBetween(input);
        expect(actual).toBe(input);
      });

      it('when minDate is in range', () => {
        const actual = getDateSameOrBetween(input, input);
        expect(actual).toBe(input);
      });

      it('when maxDate is in range', () => {
        const actual = getDateSameOrBetween(input, undefined, input);
        expect(actual).toBe(input);
      });

      it('when minDate and maxDate are in range', () => {
        const actual = getDateSameOrBetween(input, input, input);
        expect(actual).toBe(input);
      });
    });

    describe('should result in minDate', () => {
      it('when minDate is in future', () => {
        const expected = addDays(input, 1);
        const actual = getDateSameOrBetween(input, expected);
        expect(actual).toEqual(expected);
      });

      it('when minDate is closer to current', () => {
        const expected = addDays(input, 1);
        const maxDate = addDays(input, 2);
        const actual = getDateSameOrBetween(input, expected, maxDate);
        expect(actual).toEqual(expected);
      });
    });

    describe('should result in maxDate', () => {
      it('when maxDate is in past', () => {
        const expected = addDays(input, -1);
        const actual = getDateSameOrBetween(input, undefined, expected);
        expect(actual).toEqual(expected);
      });
    });

    describe('should result in maxDate', () => {
      it('when maxDate is in past', () => {
        const minDate = addDays(input, -2);
        const expected = addDays(input, -1);
        const actual = getDateSameOrBetween(input, minDate, expected);
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('addMonthsInRange', () => {
    const getDate = (y: number, m: number, d: number): Date => {
      const input = new Date();
      input.setFullYear(y, m, d);
      input.setHours(0, 0, 0, 0);
      return input;
    };

    describe('should only change the month.', () => {
      const firstData = 1;
      const longMonth = 4;
      const year = 2023;

      [-2, -1, 1, 2].forEach(monthOffset => {
        it(`when date is between 1..28 and a monthOffset ${monthOffset}`, () => {
          const input = getDate(year, longMonth, firstData);
          const actual = addMonthsInRange(input, monthOffset, undefined);
          expect(actual.getDate()).toBe(firstData);
          expect(actual.getMonth()).toBe(longMonth + monthOffset);
          expect(actual.getFullYear()).toBe(year);
        });
      });
    });
  });
});
