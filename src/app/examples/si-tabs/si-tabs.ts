/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { LOG_EVENT } from '@siemens/live-preview';

interface TabModel {
  heading: string;
  closable?: boolean;
  disabled?: boolean;
  icon?: string;
  iconAltText?: string;
  badgeColor?: string;
  badgeContent?: string | boolean;
  active?: boolean;
}

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiTabsetComponent, SiTabComponent],
  templateUrl: './si-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedTabIndex = 0;
  deselectable = true;
  activable = true;
  logEvent = inject(LOG_EVENT);

  tabs: TabModel[] = [
    { heading: 'Reception', closable: true, badgeContent: '11', active: true },
    {
      heading: 'Conference room',
      closable: true,
      badgeContent: true
    },
    {
      heading: 'Lobby',
      disabled: true
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

  closeTab(tab: TabModel): void {
    this.tabs.splice(
      this.tabs.findIndex(t => t.heading === tab.heading),
      1
    );
  }

  canDeactivate = (): boolean => {
    return this.deselectable;
  };

  canActivate = (): boolean => {
    if (!this.activable) {
      this.logEvent('Enable Allow Lobby tab activation to activate this tab');
    }
    return this.activable;
  };
}
