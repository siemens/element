/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiSliderComponent } from '@spike-rabbit/element-ng/slider';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiSliderComponent, FormsModule],
  templateUrl: './si-slider.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  slidingValue = 50;
  logEvent = inject(LOG_EVENT);
  disabled = false;
}
