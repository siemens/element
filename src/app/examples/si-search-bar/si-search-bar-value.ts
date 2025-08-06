/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiSearchBarComponent } from '@spike-rabbit/element-ng/search-bar';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiSearchBarComponent],
  templateUrl: './si-search-bar-value.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  value = 'hello123';
}
