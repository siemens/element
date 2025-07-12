/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiColorPickerComponent } from '@siemens/element-ng/color-picker';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiColorPickerComponent],
  templateUrl: './si-color-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  palette = [
    'element-data-1',
    'element-data-2',
    'element-data-3',
    'element-data-4',
    'element-data-5',
    'element-data-6',
    'element-data-7',
    'element-data-8 '
  ];

  selectedColor = 'element-data-7';
}
