/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange, SiDateRangeComponent } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiDateRangeComponent, ReactiveFormsModule],
  templateUrl: './si-date-range.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  dateRange = new FormControl<DateRange | null>(null);
}
