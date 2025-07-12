/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DatepickerInputConfig,
  SiDateInputDirective,
  SiDatepickerComponent
} from '@siemens/element-ng/datepicker';
import { SiFormItemComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiDateInputDirective, SiDatepickerComponent, SiFormItemComponent],
  templateUrl: './si-date-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  date = new Date('2022-03-12');
  config: DatepickerInputConfig = {
    showTime: true,
    showMinutes: true,
    showSeconds: true,
    mandatoryTime: true
  };
}
