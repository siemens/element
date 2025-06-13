/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  FormatWidth,
  FormStyle,
  getLocaleDateFormat,
  getLocaleDateTimeFormat,
  getLocaleDayPeriods,
  getLocaleId,
  getLocaleTimeFormat,
  TranslationWidth
} from '@angular/common';

import { WeekStart } from './si-datepicker.model';

export interface DayOfWeek {
  id: string;
  index: number;
  offset: number;
  isWeekend: boolean;
}

const WEEK_ISO: DayOfWeek[] = [
  { id: 'monday', index: 1, offset: 0, isWeekend: false },
  { id: 'tuesday', index: 2, offset: 1, isWeekend: false },
  { id: 'wednesday', index: 3, offset: 2, isWeekend: false },
  { id: 'thursday', index: 4, offset: 3, isWeekend: false },
  { id: 'friday', index: 5, offset: 4, isWeekend: false },
  { id: 'saturday', index: 6, offset: 5, isWeekend: true },
  { id: 'sunday', index: 7, offset: 6, isWeekend: true }
];

export const WEEK_START_OFFSET = {
  'monday': 0,
  'saturday': 5,
  'sunday': 6
};

const UNITS = {
  millisecondsPerDay: 86400000,
  daysPerWeek: 7,
  thursday: 4
};

const dayOfWeekMap: {
  [key: string]: DayOfWeek[];
} = {};

export const getDaysOfWeek = (weekStart: WeekStart): DayOfWeek[] => {
  weekStart = weekStart ?? 'monday';
  let weekdays: DayOfWeek[] = dayOfWeekMap[weekStart];
  if (!weekdays) {
    dayOfWeekMap[weekStart] = weekdays = [];
    const offset = WEEK_START_OFFSET[weekStart];
    for (let i = 0; i < 7; i++) {
      weekdays.push({ ...WEEK_ISO[(i + offset) % 7], offset: i });
    }
  }
  return weekdays;
};

/**
 * Get local specific months using DateTimeFormat.
 * @param locale - current locale
 */
export const getLocaleMonthNames = (locale: string): string[] => {
  const format = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format;
  return Array(12)
    .fill(0)
    .map((v, m) => format(new Date(Date.UTC(0, m))));
};

/**
 * Get local specific weekdays as string using DateTimeFormat.
 * @param locale - current local
 * @param weekStart - start of the week
 * @param format - display format
 * @returns array of week days.
 */
export const getDayStrings = (
  locale: string,
  weekStart: WeekStart = 'monday',
  format: 'narrow' | 'short' | 'long' = 'short'
): string[] => {
  const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: format, timeZone: 'utc' });
  const days = [];
  // Get local specific day strings from sunday (0) .. saturady (6)
  for (let index = 1; index <= 7; index++) {
    const day = new Date(Date.UTC(2023, 0, index));
    days.push(dateFormatter.format(day));
  }
  const map = { 'sunday': 0, 'monday': 1, 'saturday': 6 };
  const index = map[weekStart];
  return days.slice(index).concat(days.slice(0, index));
};

/**
 * Gets the first day in the specified month.
 * Expects the month as a value between 1 and 12.
 * The year is required to handle leap years.
 *
 * @returns The first day of the month as a Date.
 */
export const getFirstDayInMonth = (year: number, month: number): Date =>
  new Date(year, month - 1, 1);

/**
 * Gets the week number of the specified date.
 * Week number according to the ISO-8601 standard, weeks starting on Monday.
 * The first week of a year is the week that contains the first Thursday of the year (='First 4-day week').
 * The highest week number in a year is either 52 or 53.
 *
 * @param date -The JavaScript date object.
 * @param weekStart -Name of the first day of the week
 * @returns The number of the Week
 */
export const getWeekOfYear = (date: Date, weekStart: WeekStart): number => {
  // Algorithm rewritten from C# example given at http://en.wikipedia.org/wiki/Talk:ISO_week_date
  const dayOfWeek = getWeekDayOffset(date, weekStart) + 1;
  const nearestThu = new Date(date);
  nearestThu.setDate(date.getDate() + (UNITS.thursday - dayOfWeek)); // get nearest Thursday (-3..+3 days)
  const year = nearestThu.getFullYear();
  const janfirst = getFirstDayInMonth(year, 1);
  const days = Math.floor(((nearestThu as any) - (janfirst as any)) / UNITS.millisecondsPerDay);
  const week = 1 + Math.floor(days / UNITS.daysPerWeek); // Count of Thursdays
  return week;
};

export const getWeekDayOffset = (date: Date, weekStart: WeekStart): number => {
  const offset = WEEK_START_OFFSET[weekStart ?? 'monday'];
  return (date.getDay() + 6 - offset) % 7;
};

/** returns the date string in format YYYY-MM-DD for given date */
export const getStringforDate = (date: Date): string => {
  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();
  const year = date.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  return `${year}-${month}-${day}`;
};

/**
 * Creates a new date object on from a date with or without time.
 * @param value - The date from with the year, month and day is taken.
 * @param hours - Optional numeric value of the hours, otherwise 0.
 * @param minutes - Optional numeric value of the minutes, otherwise 0.
 * @param seconds - Optional numeric value of the seconds, otherwise 0.
 * @param milliseconds - Optional numeric value of the milliseconds, otherwise 0.
 * @returns
 */
export const createDate = (
  value: Date,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
  milliseconds: number = 0
): Date => {
  const newDate = new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    hours,
    minutes,
    seconds,
    milliseconds
  );
  // Seems redundant, but makes sure that increasing
  // the hours does no change the date when switching
  // from 11pm up.
  newDate.setFullYear(value.getFullYear());
  newDate.setMonth(value.getMonth());
  newDate.setDate(value.getDate());
  return newDate;
};

/** Creates a date but allows the month and date to overflow. */
const createDateInternal = (year: number, month: number, date: number): Date => {
  const d = new Date();
  d.setFullYear(year, month, date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const NAMED_FORMATS: { [localeId: string]: { [format: string]: string } } = {};
const INVALID_DATE = new Date(NaN);
/**
 * @param input - String containing a date or dateTime value (Ex. "05/15/2020"
 * @param format - Format of the input value (Ex. "M/d/YYYY")
 * @param locale - Locale of the input value
 * @returns A JS Date in accordance of the three parameters
 */
export const parseDate = (input: string, format: string, locale: string): Date | undefined => {
  if (!input) {
    return undefined;
  }

  const splitFormat = format.split(/[^MydhHmsSa]+/);
  const splitDate = input.toUpperCase().match(/\d+|\w+/g);
  if (!splitDate) {
    return INVALID_DATE;
  }
  // in case of some locales where meridian is with special chars
  const dateAndMeridian = input.split(/ +/);
  if (splitDate.length > 0 && dateAndMeridian.length > 0) {
    const parsedMeridian = dateAndMeridian[dateAndMeridian.length - 1].toUpperCase();
    if (
      splitDate![splitDate.length - 1] !== parsedMeridian &&
      getMeridian(parsedMeridian, locale)
    ) {
      splitDate?.push(parsedMeridian);
    }
  }
  let year = 0;
  let month = 0;
  /*
    date as in the numeric day of the month to be provided for the Date() constructor.
    default value is 1 since 0 refers to the last date of previous month.
  */
  let date = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let milliseconds = 0;

  // check if date is invalid and return if it is invalid
  for (let i = 0; i < splitDate.length; i++) {
    if (i === splitDate.length - 1) {
      const parsedMeridian = splitDate![splitDate.length - 1];
      // skip if its meridian
      if (getMeridian(parsedMeridian, locale)) {
        continue;
      }
    }
    const parsedDateVal = parseInt(splitDate![i], 10);
    if (isNaN(parsedDateVal)) {
      return INVALID_DATE;
    }
  }

  for (let i = 0; i < splitFormat.length; i++) {
    const f = splitFormat[i];
    let parsedNumber = parseInt(splitDate![i], 10);
    if (f !== 'a' && isNaN(parsedNumber)) {
      // auto fill seconds and milliseconds if not passed by user
      if (f === 'ss' || f === 'SSS') {
        parsedNumber = 0;
      } else {
        return INVALID_DATE;
      }
    }

    if (f === 'M' || f === 'MM') {
      month = parsedNumber;
    } else if (f === 'd' || f === 'dd') {
      date = parsedNumber;
    } else if (f === 'y' || f === 'yy' || f === 'yyyy') {
      // JS adds 1900 for numbers between 0 and 99. Adjust to be more user-friendly
      year =
        parsedNumber < 50
          ? parsedNumber + 2000
          : parsedNumber < 100
            ? parsedNumber + 1900
            : parsedNumber;
    } else if (f === 'h' || f === 'HH') {
      hour = parsedNumber;
    } else if (f === 'mm') {
      minute = parsedNumber;
    } else if (f === 'ss') {
      second = parsedNumber;
    } else if (f === 'SSS') {
      milliseconds = parsedNumber;
    } else if (f === 'a') {
      if (!isNaN(parseInt(splitDate![splitDate!.length - 1], 10))) {
        continue;
      }
      const parsedMeridian = splitDate![splitDate.length - 1];
      const meridian = getMeridian(parsedMeridian, locale);
      if (hour === 12 && meridian === 'AM') {
        hour = 0;
      } else if (meridian === 'PM') {
        hour = (hour % 12) + 12;
      } else if (!meridian) {
        return INVALID_DATE;
      }
    }
  }
  if (month > 12 || date > 31 || date > new Date(year, month, 0).getDate()) {
    return INVALID_DATE;
  }
  return new Date(year, month - 1, date, hour, minute, second, milliseconds);
};

const getMeridian = (parsedMeridian: string, locale: string): 'AM' | 'PM' | undefined => {
  const meridian = getLocaleDayPeriods(locale, FormStyle.Format, TranslationWidth.Short);
  const usingAM = parsedMeridian === meridian[0].toUpperCase();
  if (usingAM) {
    return 'AM';
  } else {
    const usingPM = parsedMeridian === meridian[1].toUpperCase();
    return usingPM ? 'PM' : undefined;
  }
};

// Adapted from: https://github.com/angular/angular/blob/91954cf20e17a386d71cc8ea25d1d17b9ae1e31c/packages/common/src/i18n/format_date.ts
// unfortunately it is not exported there
export const getNamedFormat = (locale: string, format: string): string => {
  const localeId = getLocaleId(locale);
  NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};

  if (NAMED_FORMATS[localeId][format]) {
    return NAMED_FORMATS[localeId][format];
  }

  let formatValue = '';
  switch (format) {
    case 'shortDate':
      formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
      break;
    case 'shortTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
      break;
    case 'mediumTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
      break;
    case 'longTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
      break;
    case 'fullTime':
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
      break;
    case 'short':
    case 'medium':
      {
        const shortTime = getNamedFormat(locale, format === 'short' ? 'shortTime' : 'mediumTime');
        const shortDate = getNamedFormat(locale, 'shortDate');
        formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [
          shortTime,
          shortDate
        ]);
      }
      break;
  }
  if (formatValue) {
    NAMED_FORMATS[localeId][format] = formatValue;
  }
  return formatValue;
};

const formatDateTime = (str: string, optVals: string[]): string => {
  if (optVals) {
    str = str.replace(/\{([^}]+)}/g, (match, key) =>
      optVals != null && key in optVals ? optVals[key] : match
    );
  }
  return str;
};

export const getDateWithoutTime = (date: Date): Date => createDate(date, 0, 0, 0, 0);

/**
 * Get today
 * @returns date of today
 */
export const today = (): Date => new Date();

/**
 * Calculate a new date based on the offset while considering the min and max date.
 * @param current - input date.
 * @param daysOffset - numeric offset of days.
 * @returns new date if the range is valid or original date
 */
export const addDaysInRange = (
  current: Date,
  daysOffset: number,
  minDate?: Date,
  maxDate?: Date
): Date => {
  const newDate = addDays(current, daysOffset);
  // Make sure the new date is within the specified limits
  // MinDate < new data < MaxDate
  if (isSameOrBetween(newDate, minDate, maxDate)) {
    return newDate;
  }
  return getDateSameOrBetween(newDate, minDate, maxDate);
};

/**
 * Get date delta based on the offset.
 * @param date - source date object.
 * @param days - numeric offset of days.
 * @returns new date.
 */
export const addDays = (date: Date, days: number): Date => {
  const d = createDate(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Update date/day of give date without changing the month.
 * In case the day exceed the number of days in the current month the last day in month will be assigned.
 * @param date - the date object to update the day.
 * @param day - the day which shall be set.
 * @returns the updated date object.
 */
export const changeDay = (date: Date, day: number): Date => {
  const lastDay = daysInMonth(date.getMonth(), date.getFullYear());
  date.setDate(lastDay <= day ? lastDay : day);
  return date;
};

/**
 * Get date delta specifically for months based on the offset.
 * @param current - starting date.
 * @param monthsOffset - numeric offset of months.
 * @param minDate - optional minimum allowed date.
 * @param maxDate - optional maximum allowed date.
 * @returns a new date object with the updated month.
 */
export const addMonthsInRange = (
  current: Date,
  monthsOffset: number,
  minDate?: Date,
  maxDate?: Date
): Date => {
  let newDate = createDateInternal(current.getFullYear(), current.getMonth() + monthsOffset, 1);
  newDate = changeDay(newDate, current.getDate());
  if (isSameOrBetween(newDate, minDate, maxDate)) {
    return newDate;
  }
  return getDateSameOrBetween(newDate, minDate, maxDate);
};

/**
 * Get date delta specifically for years based on the offset.
 * @param current - starting date.
 * @param yearsOffset - numeric offset of years.
 * @param minDate - optional minimum allowed date.
 * @param maxDate - optional maximum allowed date.
 * @returns a new date object with the updated year.
 */
export const addYearsInRange = (
  current: Date,
  yearsOffset: number,
  minDate?: Date,
  maxDate?: Date
): Date => {
  const newDate = createDateInternal(
    current.getFullYear() + yearsOffset,
    current.getMonth(),
    current.getDate()
  );
  if (isSameOrBetween(newDate, minDate, maxDate)) {
    return newDate;
  }
  return getDateSameOrBetween(newDate, minDate, maxDate);
};

/**
 * Get number of days for the given month and year.
 * @param month - month as number (0..11).
 * @param year - year as number.
 * @returns the number of days for the given month.
 */
export const daysInMonth = (month: number, year: number): number =>
  // By using 0 as the day it will give us the last day of the prior
  // month. So passing in 1 as the month number will return the last day
  new Date(year, month + 1, 0).getDate();

/**
 * Get the first date of the week based on the input date.
 * @param current - a date object from where the last date of a week is derived.
 * @param weekStartDay - optional when a week shall start.
 * @returns a new date object which is the start of the current week.
 */
export const getWeekStartDate = (current: Date, weekStartDay: WeekStart = 'monday'): Date => {
  const weekStartDate = createDate(current);
  const diff = current.getDate() - getWeekDayOffset(current, weekStartDay);
  weekStartDate.setDate(diff);
  return weekStartDate;
};

/**
 * Get the last date of the week based on the input date.
 * @param current - a date object from where the last date of a week is derived.
 * @param weekStartDay - optional when a week shall start.
 * @returns the last date within the week.
 */
export const getWeekEndDate = (current: Date, weekStartDay: WeekStart = 'monday'): Date => {
  const weekStartDate = createDate(current);
  weekStartDate.setDate(current.getDate() + 6 - getWeekDayOffset(current, weekStartDay));
  return weekStartDate;
};

/**
 * Get the beginning of the month.
 * @param current - a date object from where the first date in a month is derived.
 * @returns a new date object which starts a the first.
 */
export const getFirstDateInMonth = (current: Date): Date =>
  new Date(current.getFullYear(), current.getMonth(), 1);

/**
 * Get the last date of the month.
 * @param current - a date object from where we derive the last date in a month.
 * @returns a new date object which is the last day in the current month.
 */
export const getLastDateInMonth = (current: Date): Date =>
  new Date(current.getFullYear(), current.getMonth() + 1, 0);

/**
 * Get the beginning of the year.
 * @param current - a date object from where the first date in a year is derived.
 * @returns a new date object which starts a the first.
 */
export const getFirstDateInYear = (current: Date): Date => new Date(current.getFullYear(), 0, 1);

/**
 * Are the two dates identical without considering time.
 */
export const isSameDate = (current: Date, compareTo?: Date): boolean => {
  if (!compareTo) {
    return false;
  }
  return (
    current.getFullYear() === compareTo.getFullYear() &&
    current.getMonth() === compareTo.getMonth() &&
    current.getDate() === compareTo.getDate()
  );
};

/**
 * Are the two months identical without considering time.
 */
export const isSameMonth = (current: Date, compareTo?: Date): boolean => {
  if (!compareTo) {
    return false;
  }
  return isSameYear(current, compareTo) && current.getMonth() === compareTo.getMonth();
};

/**
 * Are the two years identical.
 */
export const isSameYear = (current: Date, compareTo?: Date): boolean => {
  if (!compareTo) {
    return false;
  }
  return current.getFullYear() === compareTo.getFullYear();
};
/**
 * Compares two dates.
 * @param first - The first date to compare.
 * @param second - The second date to compare.
 * @returns 0 if the dates are equal, a number less than 0 if the first date is earlier,
 * a number greater than 0 if the first date is later.
 */
export const compareDate = (first: Date, second: Date): number =>
  compareMonth(first, second) || first.getDate() - second.getDate();

/**
 * Compares two months.
 * @param first - The first month to compare.
 * @param second - The second month to compare.
 * @returns 0 if the months are equal, a number less than 0 if the first month is earlier,
 * a number greater than 0 if the first month is later.
 */
export const compareMonth = (first: Date, second: Date): number =>
  compareYear(first, second) || first.getMonth() - second.getMonth();

/**
 * Compares two years.
 * @param first - The first year to compare.
 * @param second - The second year to compare.
 * @returns 0 if the years are equal, a number less than 0 if the first year is earlier,
 * a number greater than 0 if the first year is later.
 */
export const compareYear = (first: Date, second: Date): number =>
  first.getFullYear() - second.getFullYear();
/**
 * Compare the current date is the same date or between start and end date.
 * @param current - the date object.
 * @param from - optional min date, if no value is provided we assume true for the min value.
 * @param to - optional max date, if no value is provided we assume true for the max value.
 * @returns true if the date is in the provided range.
 */
export const isSameOrBetween = (current: Date, from?: Date, to?: Date): boolean => {
  // from <= d
  const isInMinRange = from ? compareDate(from, current) <= 0 : true;
  // d <= to
  const isInMaxRange = to ? compareDate(current, to) <= 0 : true;
  return isInMinRange && isInMaxRange;
};

/**
 * Compare the current month is the same month or between start and end month.
 * @param current - the month object.
 * @param from - optional min month, if no value is provided we assume true for the min value.
 * @param to - optional max month, if no value is provided we assume true for the max value.
 * @returns true if the date is in the provided range.
 */
export const isSameOrBetweenMonth = (current: Date, from?: Date, to?: Date): boolean => {
  // from <= d
  const isInMinRange = from ? compareMonth(from, current) <= 0 : true;
  // d <= to
  const isInMaxRange = to ? compareMonth(current, to) <= 0 : true;
  return isInMinRange && isInMaxRange;
};

/**
 * Compare the current year is the same year or between start and end year.
 * @param current - the year object.
 * @param from - optional min year, if no value is provided we assume true for the min value.
 * @param to - optional max year, if no value is provided we assume true for the max value.
 * @returns true if the date is in the provided range.
 */
export const isSameOrBetweenYears = (current: Date, from?: Date, to?: Date): boolean => {
  // from <= d
  const isInMinRange = from ? compareYear(from, current) <= 0 : true;
  // d <= to
  const isInMaxRange = to ? compareYear(current, to) <= 0 : true;
  return isInMinRange && isInMaxRange;
};

/**
 * Compare the current date is between start and end date.
 * from \< current \< to
 */
export const isBetween = (current: Date, from?: Date, to?: Date): boolean => {
  const isInMinRange = from ? compareDate(current, from) > 0 : true;
  const isInMaxRange = to ? compareDate(current, to) < 0 : true;
  return isInMinRange && isInMaxRange;
};

/**
 * Compare the current month is between start and end month.
 * from \< current \< to
 */
export const isBetweenMonth = (current: Date, from?: Date, to?: Date): boolean => {
  const isInMinRange = from ? compareMonth(current, from) > 0 : true;
  const isInMaxRange = to ? compareMonth(current, to) < 0 : true;
  return isInMinRange && isInMaxRange;
};

/**
 * Compare the current year is between start and end year.
 * from \< current \< to
 */
export const isBetweenYears = (current: Date, from?: Date, to?: Date): boolean => {
  const isInMinRange = from ? compareYear(current, from) > 0 : true;
  const isInMaxRange = to ? compareYear(current, to) < 0 : true;
  return isInMinRange && isInMaxRange;
};

/**
 * Is first date after the second date (without considering the time).
 * current \> compareTo
 */
export const isAfter = (current: Date, compareTo: Date): boolean =>
  compareDate(current, compareTo) > 0;

/**
 * Is first month after the second month (without considering the time).
 * current \> compareTo
 */
export const isAfterMonth = (current: Date, compareTo: Date): boolean =>
  compareMonth(current, compareTo) > 0;

/**
 * Is first year after the second year.
 * current \> compareTo
 */
export const isAfterYear = (current: Date, compareTo: Date): boolean =>
  compareYear(current, compareTo) > 0;

/**
 * Is first date equal or before the second date (without considering the time).
 * current \>= compareTo
 */
export const isSameOrBefore = (current: Date, compareTo: Date): boolean =>
  compareDate(current, compareTo) <= 0;

/**
 * Is first month equal or before the second month.
 * current \>= compareTo
 */
export const isSameOrBeforeMonth = (current: Date, compareTo: Date): boolean =>
  compareMonth(current, compareTo) <= 0;

/**
 * Is first year equal or before the second year.
 * current \>= compareTo
 */
export const isSameOrBeforeYear = (current: Date, compareTo: Date): boolean =>
  compareMonth(current, compareTo) <= 0;

/**
 * Are the two dates in different months.
 */
export const isAnotherMonth = (current: Date, compareTo: Date): boolean =>
  current.getMonth() !== compareTo.getMonth();

/**
 * Are the two dates in different years.
 */
export const isAnotherYear = (current: Date, compareTo: Date): boolean =>
  current.getFullYear() !== compareTo.getFullYear();

/**
 * Are the two dates either in different months or years.
 */
export const isAnotherMonthOrYear = (current: Date, compareTo: Date): boolean =>
  isAnotherMonth(current, compareTo) || isAnotherYear(current, compareTo);

/**
 * Get a date which is in within the range and the close to current.
 */
export const getDateSameOrBetween = (current: Date, minDate?: Date, maxDate?: Date): Date => {
  if (isSameOrBetween(current, minDate, maxDate)) {
    return current;
  }
  const minDistance = minDate
    ? Math.ceil(Math.abs(current.getTime() - minDate!.getTime()))
    : Number.MAX_VALUE;
  const maxDistance = maxDate
    ? Math.ceil(Math.abs(current.getTime() - maxDate!.getTime()))
    : Number.MAX_VALUE;
  return minDistance < maxDistance ? createDate(minDate!) : createDate(maxDate!);
};

/**
 * Get date or absolute min date.
 * @param date - input date.
 * @returns date or date of 1.1.1900
 */
export const getMinDate = (date?: Date): Date =>
  date && !isNaN(date.getTime()) ? date : new Date(Date.UTC(1900, 0, 1));

/**
 * Get date or absolute max date.
 * @param date - input date.
 * @returns date or date of 31.12.2154
 */
export const getMaxDate = (date?: Date): Date =>
  date && !isNaN(date.getTime()) ? date : new Date(Date.UTC(2154, 11, 31));

/**
 * Is valid date object.
 */
export const isValid = (date?: Date): date is NonNullable<Date> => !!date && !isNaN(date.getTime());

/**
 * Returns the next months of the given date.
 * @param date - The date for which the next month is returned.
 * @returns A date of the first day of the following month of the given day.
 */
export const nextMonth = (date: Date): Date => {
  if (date.getMonth() === 11) {
    return new Date(date.getFullYear() + 1, 0, 1);
  } else {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }
};

/**
 * Returns the last day of the previous month of the given date object.
 * @param date - The date for which the previous month is returned.
 * @returns A date of the last day of the previous month of the given day.
 */
export const previousMonth = (date: Date): Date => {
  if (date.getMonth() === 0) {
    return new Date(date.getFullYear() - 1, 12, 0);
  } else {
    return new Date(date.getFullYear(), date.getMonth(), 0);
  }
};

export const minDate = (first?: Date, second?: Date): Date | undefined => {
  return !!first && !!second ? (first < second ? first : second) : (first ?? second);
};

export const maxDate = (first?: Date, second?: Date): Date | undefined => {
  return !!first && !!second ? (first > second ? first : second) : (first ?? second);
};
