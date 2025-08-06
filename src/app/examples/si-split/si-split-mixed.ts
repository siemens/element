/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PartState, SiSplitComponent, SiSplitPartComponent } from '@spike-rabbit/element-ng/split';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiSplitComponent, SiSplitPartComponent],
  templateUrl: './si-split-mixed.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  format(name: string, state: PartState): any {
    return Object.assign({ name }, state);
  }
}
