/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiIconNextComponent],
  templateUrl: './si-card.html',
  styles: `
    .card-size {
      height: 250px;
    }
  `
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  enablePrimaryActions = true;
  enableSecondaryActions = true;

  primaryItems: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  secondaryItems: MenuItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') }
  ];

  primaryActions: ContentActionBarMainItem[];
  secondaryActions: MenuItem[];

  constructor() {
    this.primaryActions = this.primaryItems;
    this.secondaryActions = this.secondaryItems;
  }

  toggleEnablePrimaryActions(): void {
    this.enablePrimaryActions = !this.enablePrimaryActions;
    if (this.enablePrimaryActions) {
      this.primaryActions = this.primaryItems;
    } else {
      this.primaryActions = [];
    }
  }

  toggleEnableSecondaryActions(): void {
    this.enableSecondaryActions = !this.enableSecondaryActions;
    if (this.enableSecondaryActions) {
      this.secondaryActions = this.secondaryItems;
    } else {
      this.secondaryActions = [];
    }
  }
}
