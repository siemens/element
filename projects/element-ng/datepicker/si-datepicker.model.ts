/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { getNamedFormat } from './date-time-helper';

export type WeekStart = 'monday' | 'saturday' | 'sunday' | undefined;

export interface DatepickerConfig {
  /**
   * Text or translation key for today button title. Default is `Today`.
   */
  todayText?: TranslatableString;
  /**
   * Defines the starting day of the week. Default is `monday`.
   */
  weekStartDay?: WeekStart;
  /**
   * Configuration for hiding week numbers. Default is `false`.
   */
  hideWeekNumbers?: boolean;
  /**
   * Defines the timepicker visibility. Default is `false`.
   */
  showTime?: boolean;
  /**
   * Defines the timepicker minutes visibility. Default is `true`.
   */
  showMinutes?: boolean;
  /**
   * Defines the timepicker seconds visibility . Default is `false`.
   */
  showSeconds?: boolean;
  /**
   * Defines the timepicker milliseconds visibility . Default is `false`.
   */
  showMilliseconds?: boolean;
  /**
   * Hides disable time switch in the timepicker part and includes mandatory the
   * time in the picker.
   */
  mandatoryTime?: boolean;
  /**
   * Defines the time is disabled when visible. Will also be updated on user change. Default is `false`.
   */
  disabledTime?: boolean;
  /**
   * Text or translation key for the `enabled` disable time. Default is `Consider time`.
   */
  enabledTimeText?: TranslatableString;
  /**
   * Text or translation key for the `disabled` disable time. Default is `Ignore time`.
   */
  disabledTimeText?: TranslatableString;
  /**
   * Minimal (earliest) selectable date.
   */
  minDate?: Date;
  /**
   * Maximal (latest) selectable date.
   */
  maxDate?: Date;
  /**
   * Options to turn on date range selection.
   */
  enableDateRange?: boolean;
  /**
   * Option to use two months view for date range picking.
   */
  enableTwoMonthDateRange?: boolean;
  /**
   * Consider time with minDate and maxDate
   */
  enableTimeValidation?: boolean;
  /**
   * Only month and year are selectable.
   */
  onlyMonthSelection?: boolean;

  hoursLabel?: string;
  minutesLabel?: string;
  secondsLabel?: string;
  millisecondsLabel?: string;
  hideLabels?: boolean;

  hoursAriaLabel?: string;
  minutesAriaLabel?: string;
  secondsAriaLabel?: string;
  millisecondsAriaLabel?: string;

  hoursPlaceholder?: string;
  minutesPlaceholder?: string;
  secondsPlaceholder?: string;
  millisecondsPlaceholder?: string;

  meridians?: string[];
  meridiansLabel?: string;
  meridiansAriaLabel?: string;

  startTimeLabel?: string;
  endTimeLabel?: string;
}

export interface DatepickerInputConfig extends DatepickerConfig {
  /**
   * A custom date/time format according the Angular date pipe (see {@link https://angular.dev/api/common/DatePipe}).
   * Only numeric date formats are supported.
   * The format is used to render the time of a date-time criterion. If not specified, `mediumTime` is
   * used if the `showSeconds` flag is true, otherwise `shortTime` as default. For the date-only
   * case, 'shortDate' is used.
   */
  dateTimeFormat?: string;
  /**
   * Similar to `dateTimeFormat`, but used when only a date is displayed
   * (e.g. when `showTime === false` or `disabledTime === true`).
   * Only numeric date formats are supported.
   */
  dateFormat?: string;
}

/**
 * Returns date / datetime format to be used for rendering a date object as text
 * to an Html input element, which has the `SiDatepickerDirective`.
 *
 * @see https://angular.dev/api/common/DatePipe?tab=usage-notes
 * @param locale - The locale for which the format is returned.
 * @param config - The config object of the datepicker.
 * @param timeWhenDisabled - If `true`, a format with time (medium or short) is returned, even if the `disabledTime` config is `true`.
 * @returns Either
 *   - a custom format provided by the config,
 *   - the localized `medium` format when time and seconds included
 *   - the localized `short` format when time and no seconds included
 */
export const getDatepickerFormat = (
  locale: string,
  config?: DatepickerInputConfig,
  timeWhenDisabled = false
): string => {
  // try format from consumer
  let dateFormat =
    config?.showTime && !config.disabledTime ? config.dateTimeFormat : config?.dateFormat;
  if (!dateFormat) {
    // no format from consumer - use default depending on configuration
    let named: string;
    if (config?.showTime && (!config.disabledTime || timeWhenDisabled)) {
      named = config.showSeconds ? 'medium' : 'short';
    } else {
      named = 'shortDate';
    }
    dateFormat = getNamedFormat(locale, named);
  }

  // patch 2-digit year to 4-digit year
  if (!dateFormat.includes('yyyy')) {
    dateFormat = dateFormat.replace('yy', 'yyyy');
  }
  if (config?.onlyMonthSelection && dateFormat.includes('d')) {
    dateFormat = dateFormat
      .replace(/\sd/, '')
      .replace(/\/d/, '')
      .replace(/d/g, '')
      .replace(/^\./, '');
  }

  return dateFormat;
};

export type DateRange = {
  start: Date | undefined;
  end: Date | undefined;
};
