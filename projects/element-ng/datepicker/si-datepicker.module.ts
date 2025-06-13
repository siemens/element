/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiCalendarButtonComponent } from './si-calendar-button.component';
import { SiDateInputDirective } from './si-date-input.directive';
import { SiDateRangeComponent } from './si-date-range.component';
import { SiDatepickerComponent } from './si-datepicker.component';
import { SiDatepickerDirective } from './si-datepicker.directive';
import { SiTimepickerComponent } from './si-timepicker.component';

@NgModule({
  imports: [
    SiCalendarButtonComponent,
    SiDateInputDirective,
    SiDatepickerComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiTimepickerComponent
  ],
  exports: [
    SiCalendarButtonComponent,
    SiDateInputDirective,
    SiDatepickerComponent,
    SiDatepickerDirective,
    SiDateRangeComponent,
    SiTimepickerComponent
  ]
})
export class SiDatepickerModule {}
