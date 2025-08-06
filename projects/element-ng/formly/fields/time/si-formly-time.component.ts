/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { SiTimepickerComponent } from '@spike-rabbit/element-ng/datepicker';

@Component({
  selector: 'si-formly-time',
  imports: [SiTimepickerComponent, ReactiveFormsModule],
  template: `<si-timepicker
    [id]="id"
    [hideLabels]="props.timeConfig?.hideLabels ?? true"
    [showMinutes]="props.timeConfig?.showMinutes ?? true"
    [showSeconds]="props.timeConfig?.showSeconds ?? false"
    [showMilliseconds]="props.timeConfig?.showMilliseconds ?? false"
    [showMeridian]="props.timeConfig?.showMeridian"
    [formControl]="formControl"
    [readonly]="props.readonly || false"
  />`
})
export class SiFormlyTimeComponent extends FieldType<FieldTypeConfig> implements OnInit {
  ngOnInit(): void {
    // if the date value is in string then first convert it into date
    this.convertValidStringToDate();
    this.formControl.registerOnChange(() => this.convertValidStringToDate());
  }

  private convertValidStringToDate(): void {
    if (this.formControl && !(this.formControl.value && this.formControl.value instanceof Date)) {
      const dateVal = new Date(this.formControl.value);
      if (!isNaN(dateVal.valueOf())) {
        this.formControl.setValue(dateVal);
      } else if (this.formControl.value !== '') {
        this.formControl.setValue('');
      }
    }
  }
}
