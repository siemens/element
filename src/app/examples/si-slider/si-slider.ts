/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiSliderComponent } from '@siemens/element-ng/slider';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-slider.html',
  host: { class: 'p-5' },
  imports: [SiSliderComponent, FormsModule]
})
export class SampleComponent {
  slidingValue = 50;
  logEvent = inject(LOG_EVENT);
  disabled = false;
}
