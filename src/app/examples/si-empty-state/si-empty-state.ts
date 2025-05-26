/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-empty-state.html',
  imports: [SiEmptyStateComponent]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
