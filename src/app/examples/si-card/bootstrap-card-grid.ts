/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent],
  templateUrl: './bootstrap-card-grid.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  primaryActions = [
    { title: 'Settings', action: () => this.logEvent('Settings clicked') },
    { title: 'Copy', action: () => this.logEvent('Copy clicked') },
    { title: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  secondaryActions = [
    { title: 'Settings', action: () => this.logEvent('Settings clicked') },
    { title: 'Copy', action: () => this.logEvent('Copy clicked') }
  ];
}
