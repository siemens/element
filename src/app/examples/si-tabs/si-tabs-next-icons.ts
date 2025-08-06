/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiTabNextComponent, SiTabsetNextComponent } from '@spike-rabbit/element-ng/tabs-next';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

interface TabModel {
  heading: string;
  closable?: boolean;
  disabled?: boolean;
  icon?: string;
  badgeColor?: string;
  badgeContent?: string | boolean;
  active?: boolean;
}

@Component({
  selector: 'app-sample',
  imports: [SiTabsetNextComponent, SiTabNextComponent],
  templateUrl: './si-tabs-next-icons.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedTabIndex = 0;
  deselectable = true;
  logEvent = inject(LOG_EVENT);

  tabs: TabModel[] = [
    {
      heading: 'Reception',
      icon: 'element-reception',
      closable: true,
      badgeContent: '11',
      active: true
    },
    {
      heading: 'Conference',
      icon: 'element-meeting',
      closable: true,
      badgeContent: true
    },
    {
      heading: 'Lobby',
      disabled: true,
      icon: 'element-couch'
    },
    {
      heading: 'Pantry',
      icon: 'element-break',
      badgeColor: 'danger',
      badgeContent: '1'
    }
  ];

  closeTab(tab: TabModel): void {
    this.tabs.splice(
      this.tabs.findIndex(t => t.heading === tab.heading),
      1
    );
  }
}
