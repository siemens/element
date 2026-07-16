/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiSplitComponent, SiSplitPartComponent } from '@siemens/element-ng/split';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiSplitComponent, SiSplitPartComponent],
  templateUrl: './si-split-nested.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
