/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiActionCardComponent, SiCardComponent } from '@siemens/element-ng/card';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiActionCardComponent, SiCardComponent],
  templateUrl: './card-variants.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') }
  ];
}
