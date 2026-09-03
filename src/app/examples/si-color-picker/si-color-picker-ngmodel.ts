/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiColorPickerComponent } from '@siemens/element-ng/color-picker';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiColorPickerComponent, FormsModule],
  templateUrl: './si-color-picker-ngmodel.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  palette = [
    'si-sys-data-categorical-1',
    'si-sys-data-categorical-2',
    'si-sys-data-categorical-3',
    'si-sys-data-categorical-4',
    'si-sys-data-categorical-5',
    'si-sys-data-categorical-6',
    'si-sys-data-categorical-7',
    'si-sys-data-categorical-8 '
  ];

  selectedColor = 'si-sys-data-categorical-7';
}
