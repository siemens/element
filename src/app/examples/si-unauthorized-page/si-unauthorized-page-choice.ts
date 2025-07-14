/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiUnauthorizedPageModule } from '@siemens/element-ng/unauthorized-page';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiUnauthorizedPageModule],
  templateUrl: './si-unauthorized-page-choice.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
