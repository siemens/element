/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class SiDateRangeComponentHarness extends ComponentHarness {
  static hostSelector = 'si-date-range';

  readonly getInputs = this.locatorForAll('input');
  readonly getCalendarButton = this.locatorFor('button[aria-label="Open calendar"]');

  static with(): HarnessPredicate<SiDateRangeComponentHarness> {
    return new HarnessPredicate(SiDateRangeComponentHarness, {});
  }
}
