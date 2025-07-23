/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTabDeselectionEvent, SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { LOG_EVENT } from '@siemens/live-preview';

interface TabModel {
  heading: string;
  closable?: boolean;
  disabled?: boolean;
  icon?: string;
  iconAltText?: string;
  badgeColor?: string;
  badgeContent?: string | boolean;
}

@Component({
  selector: 'app-sample',
  imports: [SiTabComponent, SiTabsetComponent, FormsModule],
  templateUrl: './si-tabs.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedTabIndex = 0;
  deselectable = true;
  logEvent = inject(LOG_EVENT);

  tabs: TabModel[] = [
    { heading: 'Reception', closable: true, badgeContent: '11' },
    {
      heading: 'Conference room',
      closable: true,
      badgeContent: true
    },
    {
      heading: 'Lobby',
      disabled: true,
      icon: 'element-couch',
      iconAltText: 'Hall'
    },
    {
      heading: 'Pantry',
      badgeColor: 'danger',
      badgeContent: '1'
    },
    {
      heading: 'Washroom',
      badgeColor: 'warning',
      badgeContent: '2'
    }
  ];

  deselection(e: SiTabDeselectionEvent): void {
    if (e.target.heading === 'Deselectable' && !this.deselectable) {
      e.cancel();
    }
  }

  closeTab(tab: TabModel): void {
    this.tabs.splice(this.tabs.indexOf(tab), 1);
  }
}
