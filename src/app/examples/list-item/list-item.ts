/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, inject } from '@angular/core';
import {
  elementArchive,
  elementCheckboxChecked,
  elementDelete,
  elementDocument,
  elementAhuPlant,
  elementSpecialObject
} from '@siemens/element-icons';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { addIcons, SiIconComponent, SiStatusIconComponent } from '@siemens/element-ng/icon';
import { type MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiIconComponent,
    SiMenuFactoryComponent,
    SiAvatarComponent,
    SiCircleStatusComponent,
    SiStatusIconComponent,
    CdkMenuTrigger
  ],
  templateUrl: './list-item.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  icons = addIcons({
    elementArchive,
    elementCheckboxChecked,
    elementDelete,
    elementDocument,
    elementAhuPlant,
    elementSpecialObject
  });

  items: MenuItem[] = [
    { type: 'action', label: 'View details', action: () => this.logEvent('View details') },
    {
      type: 'action',
      label: 'Assign technician',
      action: () => this.logEvent('Assign technician')
    },
    { type: 'action', label: 'Export log', action: () => this.logEvent('Export log') }
  ];
}
