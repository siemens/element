/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange, SiDateRangeComponent } from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, ReactiveFormsModule, SiDateRangeComponent, SiFormItemComponent],
  templateUrl: './si-date-range.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  dateRange = new FormControl<DateRange | null>(null);
}
