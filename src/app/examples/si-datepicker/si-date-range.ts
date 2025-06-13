/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange, SiDateRangeComponent } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  templateUrl: './si-date-range.html',
  imports: [CommonModule, SiDateRangeComponent, ReactiveFormsModule]
})
export class SampleComponent {
  dateRange = new FormControl<DateRange | null>(null);
}
