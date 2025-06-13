/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of calendar cell. */
export interface SiCalendarCellHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the cell. */
  text?: string | RegExp;
  /** Filters based on whether the cell is selected. */
  isSelected?: boolean;
  /** Filters based on whether the cell is activated using keyboard navigation */
  isActive?: boolean;
  /** Filters based on whether the cell is disabled. */
  isDisabled?: boolean;
  /** Filters based on whether the cell represents today's date. */
  isToday?: boolean;
  /** Filters shall include preview cells. */
  isPreview?: boolean;
}

export class SiCalendarCellHarness extends ComponentHarness {
  static hostSelector = '.si-calendar-cell';

  private content = this.locatorFor('.si-calendar-date-cell');

  static with(options: SiCalendarCellHarnessFilters = {}): HarnessPredicate<SiCalendarCellHarness> {
    return new HarnessPredicate(SiCalendarCellHarness, options)
      .addOption('text', options.text, (harness, text) => {
        return HarnessPredicate.stringMatches(harness.getText(), text);
      })
      .addOption('isActive', options.isActive, async (harness, active) => {
        return (await harness.isActive()) === active;
      })
      .addOption('isDisabled', options.isDisabled, async (harness, disabled) => {
        return (await harness.isDisabled()) === disabled;
      })
      .addOption('isSelected', options.isSelected, async (harness, selected) => {
        return (await harness.isSelected()) === selected;
      })
      .addOption('isToday', options.isToday, async (harness, today) => {
        return (await harness.isToday()) === today;
      })
      .addOption('isPreview', options.isPreview, async (harness, preview) => {
        return (await harness.isPreview()) === preview;
      });
  }

  async isActive(): Promise<boolean> {
    return (await (await this.content()).getAttribute('cdkfocusinitial')) !== null;
  }

  async isDisabled(): Promise<boolean> {
    return (await this.content()).hasClass('disabled');
  }

  async isSelected(): Promise<boolean> {
    return (await this.content()).hasClass('selected');
  }

  async isToday(): Promise<boolean> {
    return (await this.content()).hasClass('today');
  }

  async getText(): Promise<string> {
    return (await this.content()).text();
  }

  async select(): Promise<void> {
    return (await this.content()).click();
  }

  async isPreview(): Promise<boolean> {
    return (await this.content()).hasClass('text-secondary');
  }
}
