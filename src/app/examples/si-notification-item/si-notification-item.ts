/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiStatusIconComponent } from '@siemens/element-ng/icon';
import {
  SiNotificationItemComponent,
  type NotificationItemQuickAction,
  type NotificationItemActionButton,
  type NotificationItemActionIconButton,
  type NotificationItemMenu,
  type NotificationItemLink
} from '@siemens/element-ng/notification-item';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiNotificationItemComponent,
    SiAvatarComponent,
    SiCircleStatusComponent,
    FormsModule,
    SiFormItemComponent,
    SiStatusIconComponent
  ],
  templateUrl: './si-notification-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  description =
    'Important system notification requiring your attention. Please review the details and take appropriate action if needed.';

  logEvent = inject(LOG_EVENT);

  unread = false;
  showPrimaryAction = true;
  showQuickActions = true;

  itemLink: NotificationItemLink = {
    type: 'link',
    href: 'https://www.siemens.com',
    target: '_blank'
  };

  quickActions: NotificationItemQuickAction[] = [
    {
      type: 'action-icon-button',
      icon: 'element-checkbox-checked',
      ariaLabel: 'Read',
      action: () => this.logEvent('Read')
    },
    {
      type: 'action-icon-button',
      icon: 'element-archive',
      ariaLabel: 'Archive',
      action: () => this.logEvent('Archive')
    },
    {
      type: 'action-icon-button',
      icon: 'element-delete',
      ariaLabel: 'Delete',
      action: () => this.logEvent('Delete')
    }
  ];

  quickActionsLinks: NotificationItemQuickAction[] = [
    {
      type: 'link',
      icon: 'element-home',
      ariaLabel: 'Home',
      href: 'https://www.siemens.com',
      target: '_blank'
    },
    {
      type: 'router-link',
      icon: 'element-export',
      ariaLabel: 'Home',
      routerLink: '/'
    }
  ];

  menu: NotificationItemMenu = {
    type: 'menu',
    menuItems: [
      {
        type: 'action',
        label: 'Action 1',
        action: () => this.logEvent('Action 1')
      },
      {
        type: 'action',
        label: 'Action 2',
        action: () => this.logEvent('Action 2')
      },
      {
        type: 'action',
        label: 'Action 3',
        action: () => this.logEvent('Action 3')
      }
    ]
  };

  iconButton: NotificationItemActionIconButton = {
    type: 'action-icon-button',
    icon: 'element-share',
    ariaLabel: 'Share',
    action: () => this.logEvent('Share')
  };

  actionButton: NotificationItemActionButton = {
    type: 'action-button',
    label: 'Dismiss',
    action: () => this.logEvent('Dismiss')
  };
}
