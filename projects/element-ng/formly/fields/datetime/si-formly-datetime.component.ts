/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { SiCalendarButtonComponent, SiDatepickerDirective } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'si-formly-datetime',
  imports: [FormsModule, ReactiveFormsModule, SiCalendarButtonComponent, SiDatepickerDirective],
  templateUrl: './si-formly-datetime.component.html'
})
export class SiFormlyDateTimeComponent extends FieldType<FieldTypeConfig> implements OnInit {
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
