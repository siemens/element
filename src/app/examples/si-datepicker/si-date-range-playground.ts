/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DatepickerInputConfig,
  DateRange,
  SiDateRangeComponent,
  WeekStart
} from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { LOG_EVENT } from '@siemens/live-preview';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    JsonPipe,
    KeyValuePipe,
    ReactiveFormsModule,
    SiDateRangeComponent,
    SiFormItemComponent
  ],
  templateUrl: './si-date-range-playground.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  readonly logEvent = inject(LOG_EVENT);

  readonly dateRange = new FormControl<DateRange | null>({
    start: new Date('2023-03-15T07:23:00.000Z'),
    end: new Date('2023-12-15T06:33:00.000Z')
  });

  readonly configForm = new FormGroup({
    dateFormat: new FormControl<string>('dd.MM.yyyy', { nonNullable: true }),
    todayText: new FormControl('Today', { nonNullable: true }),
    weekStartDay: new FormControl<WeekStart>('monday', { nonNullable: true }),
    hideWeekNumbers: new FormControl(false, { nonNullable: true }),
    enableTwoMonthDateRange: new FormControl(true, { nonNullable: true }),
    showTime: new FormControl(true, { nonNullable: true }),
    showSeconds: new FormControl(false, { nonNullable: true }),
    showMilliseconds: new FormControl(false, { nonNullable: true }),
    onlyMonthSelection: new FormControl(false, { nonNullable: true }),
    disabledTime: new FormControl(false, { nonNullable: true }),
    mandatoryTime: new FormControl(false, { nonNullable: true }),
    minDateString: new FormControl('2018-06-15', { nonNullable: true }),
    maxDateString: new FormControl('2025-07-15', { nonNullable: true })
  });

  disabledTime = false;
  config: DatepickerInputConfig = {
    dateFormat: this.configForm.controls.dateFormat.value,
    minDate: new Date(this.configForm.controls.minDateString.value),
    maxDate: new Date(this.configForm.controls.maxDateString.value),
    enableTwoMonthDateRange: true,
    showTime: true,
    showSeconds: false,
    showMilliseconds: false,
    disabledTime: this.disabledTime,
    mandatoryTime: false
  };

  startPlaceholder!: string;
  endPlaceholder!: string;
  required = true;
  readonly = false;
  autoClose = false;

  ngOnInit(): void {
    const format = this.configForm.controls.dateFormat.value;
    this.startPlaceholder = `Start ${format}`;
    this.endPlaceholder = `End ${format}`;
    // Update configuration on value change
    this.configForm.valueChanges
      .pipe(
        map(c => {
          const minDate = new Date(c.minDateString!);
          const maxDate = new Date(c.maxDateString!);
          return { ...c, minDate, maxDate };
        }),
        filter(() => this.configForm.valid)
      )
      .subscribe(c => {
        this.config = c;
        if (this.config.dateFormat) {
          this.startPlaceholder = `Start ${this.config.dateFormat}`;
          this.endPlaceholder = `End ${this.config.dateFormat}`;
        }
      });
  }

  stringify(value: any): string {
    return JSON.stringify(value);
  }

  disableChange(disable: boolean): void {
    if (disable) {
      this.dateRange.disable();
    } else {
      this.dateRange.enable();
    }
  }
}
