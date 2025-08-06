/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { ToggleHarness } from '@spike-rabbit/element-ng/testing';

import { SiCalendarCellHarness, SiCalendarCellHarnessFilters } from './si-calendar-cell.harness';

export class SiDatepickerComponentHarness extends ComponentHarness {
  static hostSelector = 'si-datepicker';

  static with(): HarnessPredicate<SiDatepickerComponentHarness> {
    return new HarnessPredicate(SiDatepickerComponentHarness, {});
  }

  async getCells(filter: SiCalendarCellHarnessFilters = {}): Promise<SiCalendarCellHarness[]> {
    return this.locatorForAll(SiCalendarCellHarness.with(filter))();
  }

  async selectCell(filter: SiCalendarCellHarnessFilters = {}): Promise<void> {
    const cells = await this.getCells(filter);
    await cells[0].select();
  }

  async getCurrentView(): Promise<'day' | 'month' | 'year'> {
    if (await this.locatorForOptional('si-day-selection')()) {
      return 'day';
    }

    if (await this.locatorForOptional('si-month-selection')()) {
      return 'month';
    }

    return 'year';
  }

  /**
   * Goes to the previous page of the current view.
   * - Withing the day view, this goes to the previous month
   * - Withing the month view, this goes to the previous year
   * - Withing the year view, this goes to the previous 20 years
   */
  async previous(): Promise<void> {
    return (await this.locatorFor('.previous-button')()).click();
  }
  /**
   * Goes to the next page of the current view.
   * - Withing the day view, this goes to the next month
   * - Withing the month view, this goes to the next year
   * - Withing the year view, this goes to the next 20 years
   */
  async next(): Promise<void> {
    return (await this.locatorFor('.next-button')()).click();
  }

  /** Queries for the Consider Time toggle. */
  async considerTimeSwitch(): Promise<ToggleHarness> {
    return this.locatorFor(ToggleHarness)();
  }

  async considerTimeLabel(): Promise<string> {
    return (await this.locatorFor('.form-switch label')()).text();
  }

  /** Queries month view button. */
  async monthViewButton(): Promise<TestElement> {
    return await this.locatorFor('.open-month-view')();
  }

  async showMonthView(): Promise<void> {
    return (await this.monthViewButton()).click();
  }

  /** Queries year view button. */
  async yearViewButton(): Promise<TestElement> {
    return await this.locatorFor('.open-year-view')();
  }

  async showYearView(): Promise<void> {
    return (await this.yearViewButton()).click();
  }

  async todayButton(): Promise<TestElement> {
    return await this.locatorFor('.today-button')();
  }

  async showToday(): Promise<void> {
    return (await this.todayButton()).click();
  }
}
