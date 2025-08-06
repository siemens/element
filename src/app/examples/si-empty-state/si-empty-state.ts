/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiEmptyStateComponent],
  templateUrl: './si-empty-state.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
