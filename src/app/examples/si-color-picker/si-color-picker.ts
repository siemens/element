/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiColorPickerComponent } from '@siemens/element-ng/color-picker';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiColorPickerComponent],
  templateUrl: './si-color-picker.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  palette = [
    'si-sys-data-categorial-1',
    'si-sys-data-categorial-2',
    'si-sys-data-categorial-3',
    'si-sys-data-categorial-4',
    'si-sys-data-categorial-5',
    'si-sys-data-categorial-6',
    'si-sys-data-categorial-7',
    'si-sys-data-categorial-8 '
  ];

  selectedColor = 'si-sys-data-categorial-7';
}
