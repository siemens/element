/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  templateUrl: './si-search-bar-value.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiSearchBarComponent]
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  value = 'hello123';
}
