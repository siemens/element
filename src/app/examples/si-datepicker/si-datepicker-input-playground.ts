/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DatepickerInputConfig,
  getDatepickerFormat,
  SiCalendarButtonComponent,
  SiDatepickerDirective,
  WeekStart
} from '@spike-rabbit/element-ng/datepicker';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { LOG_EVENT } from '@spike-rabbit/live-preview';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SiDatepickerDirective,
    SiCalendarButtonComponent,
    SiFormItemComponent
  ],
  templateUrl: './si-datepicker-input-playground.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  readonly logEvent = inject(LOG_EVENT);

  configForm = new FormGroup({
    dateTimeFormat: new FormControl('dd.MM.yyyy HH:mm', { nonNullable: true }),
    dateFormat: new FormControl<string>('dd.MM.yyyy', { nonNullable: true }),
    todayText: new FormControl('Today', { nonNullable: true }),
    weekStartDay: new FormControl<WeekStart>('monday', { nonNullable: true }),
    hideWeekNumbers: new FormControl(false, { nonNullable: true }),
    showTime: new FormControl(false, { nonNullable: true }),
    showMinutes: new FormControl(false, { nonNullable: true }),
    showSeconds: new FormControl(false, { nonNullable: true }),
    showMilliseconds: new FormControl(false, { nonNullable: true }),
    onlyMonthSelection: new FormControl(false, { nonNullable: true }),
    mandatoryTime: new FormControl(false, { nonNullable: true }),
    disabledTime: new FormControl(false, { nonNullable: true }),
    enabledTimeText: new FormControl('Consider time', { nonNullable: true }),
    disabledTimeText: new FormControl('Ignore time', { nonNullable: true }),
    enableTimeValidation: new FormControl(false, { nonNullable: true }),
    minDateString: new FormControl(this.getDateRange().minDate, { nonNullable: true }),
    maxDateString: new FormControl(this.getDateRange().maxDate, { nonNullable: true })
  });

  config: DatepickerInputConfig = {
    dateTimeFormat: this.configForm.controls.dateTimeFormat.value,
    dateFormat: this.configForm.controls.dateFormat.value,
    minDate: new Date(this.configForm.controls.minDateString.value),
    maxDate: new Date(this.configForm.controls.maxDateString.value)
  };
  value = new Date();
  placeholder: string;
  required = true;
  readonly = false;
  disabled = false;
  autoClose = false;

  protected locale = inject(LOCALE_ID);

  constructor() {
    this.placeholder = getDatepickerFormat(this.locale, this.config);
  }

  // Set a range of 3 years in the past and 3 years in the future to current date
  private getDateRange(): { minDate: string; maxDate: string } {
    const dateNow = new Date();
    const minDate = new Date(dateNow);
    const maxDate = new Date(dateNow);

    minDate.setFullYear(dateNow.getFullYear() - 3);
    maxDate.setFullYear(dateNow.getFullYear() + 3);

    return {
      minDate: minDate.toISOString().slice(0, 16),
      maxDate: maxDate.toISOString().slice(0, 16)
    };
  }

  ngOnInit(): void {
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
        this.placeholder = getDatepickerFormat(this.locale, this.config);
      });
  }

  stringify(value: any): string {
    return JSON.stringify(value);
  }
}
