/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SiDatepickerComponent } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiDatepickerComponent],
  templateUrl: './si-datepicker.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  myDate = new Date('2022-03-12T05:00:00.000Z');
  minDate = new Date('2014-03-12T05:00:00.000Z');
}
