/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  elementArchive,
  elementCheckboxChecked,
  elementDelete,
  elementDocument
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuFactoryComponent, type MenuItem } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent, SiMenuFactoryComponent, CdkMenuTrigger],
  templateUrl: './list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  icons = addIcons({ elementCheckboxChecked, elementArchive, elementDelete, elementDocument });

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
