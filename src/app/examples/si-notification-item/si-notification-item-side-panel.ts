/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import type { MenuItemAction } from '@siemens/element-ng/menu';
import {
  SiNotificationItemComponent,
  type NotificationItemLink,
  type NotificationItemQuickAction,
  type NotificationItemRouterLink
} from '@siemens/element-ng/notification-item';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';
import { LOG_EVENT } from '@siemens/live-preview';

interface Notification {
  itemLink?: NotificationItemRouterLink | NotificationItemLink;
  timeStamp: string;
  heading: string;
  description: string;
  quickActions: NotificationItemQuickAction[];
  unread?: boolean;
}

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    SiHeaderActionItemComponent,
    SiHeaderLogoDirective,
    SiHeaderCollapsibleActionsComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderDropdownItemComponent,
    SiHeaderAccountItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderSelectionItemComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiNotificationItemComponent,
    SiSearchBarComponent,
    SiSummaryChipComponent
  ],
  templateUrl: './si-notification-item-side-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  allTenants = ['Tenant 1', 'Tenant 2', 'Tenant 3'];
  activeTenant = 'Tenant 1';

  protected readonly notificationFilters = new FormGroup({
    showAll: new FormControl(true, { nonNullable: true }),
    showUnread: new FormControl(true, { nonNullable: true }),
    showArchived: new FormControl(false, { nonNullable: true })
  });

  collapsed = true;

  toggleSidepanel(): void {
    this.collapsed = !this.collapsed;
  }

  sidePanelPrimaryAction: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Mark all as read',
      icon: 'element-checkbox-checked',
      action: () => this.logEvent('Mark all as read')
    }
  ];

  itemLink: NotificationItemLink = {
    type: 'link',
    href: 'https://www.siemens.com',
    target: '_blank'
  };

  quickActions: NotificationItemQuickAction[] = [
    {
      type: 'action-circle-button',
      icon: 'element-checkbox-checked',
      ariaLabel: 'Read',
      action: () => this.logEvent('Read')
    },
    {
      type: 'action-circle-button',
      icon: 'element-archive',
      ariaLabel: 'Archive',
      action: () => this.logEvent('Archive')
    },
    {
      type: 'action-circle-button',
      icon: 'element-delete',
      ariaLabel: 'Delete',
      action: () => this.logEvent('Delete')
    }
  ];

  filteredNotifications: Notification[] = [];

  notificationsUnread: Notification[] = [
    {
      itemLink: this.itemLink,
      timeStamp: 'Just now',
      heading: 'System alert requires attention',
      description:
        'Production equipment has stopped unexpectedly. Technical team has been notified and is investigating the issue.',
      quickActions: this.quickActions,
      unread: true
    },
    {
      itemLink: this.itemLink,
      timeStamp: '2 minutes ago',
      heading: 'Team assignment completed',
      description:
        'Maintenance personnel have been dispatched to address the equipment issue. Estimated resolution time is 45 minutes.',
      quickActions: this.quickActions,
      unread: true
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'Today at 11:45',
      heading: 'Budget approval requested',
      description:
        'Additional funds needed for equipment replacement. Please review the request and provide approval by end of business day.',
      quickActions: this.quickActions,
      unread: true
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'Today at 09:30',
      heading: 'Access permissions updated',
      description:
        'Temporary access has been granted to external contractor for equipment maintenance. Access expires at 6:00 PM today.',
      quickActions: this.quickActions,
      unread: true
    }
  ];

  notificationAll: Notification[] = [
    {
      itemLink: this.itemLink,
      timeStamp: 'Two weeks ago',
      heading: 'Software update completed',
      description:
        'System sensors have been successfully upgraded to the latest firmware version. Enhanced monitoring capabilities are now available.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'One month ago',
      heading: 'Training session completed',
      description:
        'All team members have completed the required safety certification training. Certificates remain valid for one year.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'One month ago',
      heading: 'Monthly performance report available',
      description:
        'Latest analytics show improvement in operational efficiency. Detailed metrics and insights are available for review.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'One month ago',
      heading: 'Contractor evaluation completed',
      description:
        'Performance review has been completed for external service provider. Overall rating shows satisfactory work quality.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'Two months ago',
      heading: 'Annual budget approved',
      description:
        'Funding has been approved for equipment replacement and maintenance operations for the upcoming fiscal year.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'Two months ago',
      heading: 'Maintenance schedule finalized',
      description:
        'Quarterly maintenance plan has been completed. All equipment inspections are scheduled for the following week.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'Two months ago',
      heading: 'New team member onboarded',
      description:
        'A new supervisor has joined the maintenance team. Onboarding process is complete and start date is confirmed.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'Two months ago',
      heading: 'Security audit completed',
      description:
        'Annual security review has been completed successfully. All access controls and permissions have been verified and updated.',
      quickActions: this.quickActions
    }
  ];

  notificationsArchived: Notification[] = [
    {
      itemLink: this.itemLink,
      timeStamp: 'Two weeks ago',
      heading: 'Equipment calibration completed',
      description:
        'Previous sensor issues have been resolved. Equipment has been recalibrated and returned to full operational capacity.',
      quickActions: this.quickActions
    },
    {
      itemLink: this.itemLink,
      timeStamp: 'One month ago',
      heading: 'Equipment disposal completed',
      description:
        'Outdated machinery has been safely disposed of following environmental guidelines. Space is now available for new installations.',

      quickActions: this.quickActions
    }
  ];

  private updateFilteredNotifications(): void {
    const { showAll, showUnread, showArchived } = this.notificationFilters.value;

    const combined: Notification[] = [];

    if (showUnread) {
      combined.push(...this.notificationsUnread);
    }

    if (showAll) {
      combined.push(...this.notificationAll);
    }

    if (showArchived) {
      combined.push(...this.notificationsArchived);
    }

    // Optionally, filter duplicates if necessary
    this.filteredNotifications = Array.from(new Set(combined));
  }

  constructor() {
    this.updateFilteredNotifications(); // initial load

    this.notificationFilters.valueChanges.subscribe(() => {
      this.updateFilteredNotifications();
    });
  }
}
