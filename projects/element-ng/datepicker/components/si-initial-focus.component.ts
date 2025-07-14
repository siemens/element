/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  booleanAttribute,
  Component,
  input,
  model,
  output,
  viewChild
} from '@angular/core';

import { Cell, SiCalendarBodyComponent } from './si-calendar-body.component';

/**
 * Helper directive to set the initial focus to the calendar body cell.
 */
@Component({
  template: ''
})
export class SiInitialFocusComponent implements AfterViewInit {
  /** The cell which has the mouse hover. */
  readonly activeHover = model<Cell>();
  /** The date which is displayed as selected. */
  readonly startDate = input<Date>();
  /** The date which is displayed as selected end. The value is only considered with enableRangeSelection. */
  readonly endDate = input<Date>();
  /**
   * Guard to set the focus during ngAfterViewInit, we just set the focus after we first initialized the view
   *
   * @defaultValue true
   */
  readonly initialFocus = input(true);
  /** The minimum selectable date. */
  readonly minDate = input<Date>();
  /** The maximum selectable date. */
  readonly maxDate = input<Date>();
  /**
   * Optional input to control the minimum month the datepicker can show and the user can navigate.
   * The `minMonth` can be larger than the `minDate` This option enables the usage of multiple
   * datepickers next to each other while the more left calendar always
   * shows an earlier month the more right one.
   */
  readonly minMonth = input<Date>();
  /**
   * Optional input to control the maximum month the datepicker can show and the user can navigate.
   * The `maxMonth` can be smaller than the `maxDate` This option enables the usage of multiple
   * datepickers next to each other while the more left calendar always
   * shows an earlier month the more right one.
   */
  readonly maxMonth = input<Date>();
  /** Aria label for the next button. Needed for a11y. */
  readonly previousLabel = input.required<string>();
  /**  Aria label for the next button. Needed for a11y. */
  readonly nextLabel = input.required<string>();
  /**
   * Is range selection enabled, when enabled it shows a preview between the startDate and the focused date.
   *
   * @defaultValue false
   */
  readonly isRangeSelection = input(false, { transform: booleanAttribute });
  /**
   * Indicate whether a range preview shall be displayed.
   * When enabled a preview is visible between startDate and focusedDate.
   *
   * @defaultValue true
   */
  readonly previewRange = input(true, { transform: booleanAttribute });
  /**
   * Emits when a new value is selected. In case where the value is null to
   * user aborted the selection by Escape.
   */
  readonly selectedValueChange = output<Date | null>();
  /** The body of calendar table */
  protected readonly calendarBody = viewChild.required(SiCalendarBodyComponent);

  ngAfterViewInit(): void {
    if (this.initialFocus()) {
      this.focusActiveCell();
    }
  }

  /**
   * Focus calendar cell which is marked as active cell.
   */
  focusActiveCell(): void {
    this.calendarBody().focusActiveCell();
  }

  protected onActiveHoverChange(event?: Cell): void {
    this.activeHover.set(event);
  }
}
