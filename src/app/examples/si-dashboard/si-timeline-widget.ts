/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { SiTimelineWidgetComponent, SiTimelineWidgetItem } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { Link } from '@siemens/element-ng/link';
import { MenuItem } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiTimelineWidgetComponent, SiEmptyStateComponent],
  templateUrl: './si-timeline-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  logEvent = inject(LOG_EVENT);
  private cdRef = inject(ChangeDetectorRef);

  link: Link = { title: 'Home', 'link': '/' };
  exportLink: Link = { href: 'https://element.siemens.io' };

  simplActionLink: Link = {
    title: 'Do something',
    action: () => alert('Hello Element!'),
    tooltip: 'APP.CLAIM'
  };

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  secondaryActions: MenuItem[] = [
    { type: 'action', label: 'Secondary 1', action: () => this.logEvent('Secondary 1 clicked') },
    { type: 'action', label: 'Secondary 2', action: () => this.logEvent('Secondary 2 clicked') }
  ];

  links?: Link[];

  historyItemsA?: SiTimelineWidgetItem[];

  historyItemsB: SiTimelineWidgetItem[] = [
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast',
      action: {
        type: 'menu',
        menuItems: [
          { type: 'action', label: 'Item 1', action: () => this.logEvent('Item 1') },
          { type: 'action', label: 'Item 2', action: () => this.logEvent('Item 2') },
          { type: 'action', label: 'Item 3', action: () => this.logEvent('Item 3') }
        ]
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-triangle-filled',
      iconColor: 'status-warning',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-warning-contrast',
      action: {
        type: 'menu',
        menuItems: [
          { type: 'action', label: 'Item 1', action: () => this.logEvent('Item 1') },
          { type: 'action', label: 'Item 2', action: () => this.logEvent('Item 2') },
          { type: 'action', label: 'Item 3', action: () => this.logEvent('Item 3') }
        ]
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-octagon-filled',
      iconColor: 'status-critical',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-critical-contrast',
      action: {
        type: 'action',
        label: 'Redo',
        icon: 'element-redo',
        iconOnly: true,
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-45-filled',
      iconColor: 'status-caution',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-caution-contrast',
      action: {
        type: 'menu',
        menuItems: [
          { type: 'action', label: 'Item 1', action: () => this.logEvent('Item 1') },
          { type: 'action', label: 'Item 2', action: () => this.logEvent('Item 2') },
          { type: 'action', label: 'Item 3', action: () => this.logEvent('Item 3') }
        ]
      }
    }
  ];

  historyItemsC: SiTimelineWidgetItem[] = [];

  historyItemsD: SiTimelineWidgetItem[] = [
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-triangle-filled',
      iconColor: 'status-warning',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-warning-contrast',
      action: {
        type: 'action',
        label: 'Action',
        customClass: 'btn-secondary',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-45-filled',
      iconColor: 'status-caution',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-caution-contrast',
      action: {
        type: 'action',
        label: 'Action',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-filled',
      iconColor: 'status-info',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'status-info-contrast',
      action: {
        type: 'action',
        label: 'Action',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast',
      action: {
        type: 'action',
        label: 'Action',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    }
  ];

  historyItemsE: SiTimelineWidgetItem[] = [
    {
      timeStamp: 'Just now',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      icon: 'element-circle-filled',
      iconColor: 'status-info',
      stackedIcon: 'element-state-progress',
      stackedIconColor: 'status-info-contrast',
      action: {
        type: 'link',
        label: 'Export',
        icon: 'element-export',
        iconOnly: true,
        href: this.exportLink.href!
      }
    },
    {
      timeStamp: 'Today 14:28',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      icon: 'element-square-filled',
      iconColor: 'status-info',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'status-info-contrast',
      action: {
        type: 'link',
        label: 'Export',
        icon: 'element-export',
        iconOnly: true,
        href: this.exportLink.href!
      }
    },
    {
      timeStamp: 'Today 11:18',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast'
    }
  ];

  historyItemsF: SiTimelineWidgetItem[] = [
    {
      timeStamp: 'Today 16:41',
      title: 'Title',
      icon: 'element-wind'
    },
    {
      timeStamp: 'Today 14:54',
      title: 'Title',
      icon: 'element-sun',
      action: {
        type: 'action',
        label: 'Copy',
        icon: 'element-copy',
        customClass: 'btn-ghost',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 09:21',
      title: 'Title',
      icon: 'element-cloudy'
    },
    {
      timeStamp: 'Yesterday 17:59',
      title: 'Title',
      icon: 'element-rain',
      action: {
        type: 'router-link',
        label: this.link.title!,
        icon: 'element-export',
        routerLink: this.link.link!
      }
    },
    {
      timeStamp: 'Yesterday 14:30',
      title: 'Title',
      icon: 'element-storm'
    },
    {
      timeStamp: 'Yesterday 08:43',
      title: 'Title',
      icon: 'element-cloudy'
    }
  ];

  ngOnInit(): void {
    setTimeout(() => {
      this.historyItemsA = this.historyItemsD;
      this.historyItemsC = this.historyItemsB.map(({ description, ...item }) => item);
      this.cdRef.markForCheck();
    }, 2000);
  }
}
