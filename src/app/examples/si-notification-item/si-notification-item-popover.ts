/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderCollapsibleActionsComponent,
  SiHeaderLogoDirective,
  SiHeaderSelectionItemComponent
} from '@siemens/element-ng/application-header';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { SiStatusIconComponent } from '@siemens/element-ng/icon';
import {
  SiNotificationItemComponent,
  type NotificationItemLink
} from '@siemens/element-ng/notification-item';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    SiHeaderActionItemComponent,
    SiHeaderLogoDirective,
    SiHeaderCollapsibleActionsComponent,
    RouterLink,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderDropdownItemComponent,
    SiHeaderAccountItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderSelectionItemComponent,
    SiNotificationItemComponent,
    SiStatusIconComponent
  ],
  templateUrl: './si-notification-item-popover.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  allTenants = ['Tenant 1', 'Tenant 2', 'Tenant 3'];
  activeTenant = 'Tenant 1';

  itemLink: NotificationItemLink = {
    type: 'link',
    href: 'https://www.siemens.com',
    target: '_blank'
  };
}
