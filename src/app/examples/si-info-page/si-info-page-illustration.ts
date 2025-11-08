/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SiInfoPageComponent } from '@siemens/element-ng/info-page';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiInfoPageComponent],
  templateUrl: './si-info-page-illustration.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
