/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiSplitComponent, SiSplitPartComponent } from '@siemens/element-ng/split';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-split-vertical.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiSplitComponent, SiSplitPartComponent]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
}
