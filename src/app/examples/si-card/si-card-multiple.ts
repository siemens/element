/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent],
  templateUrl: './si-card-multiple.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  secondaryActions: MenuItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') }
  ];

  cards = new Array(80);
}
