/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
      iconColor: 'text-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-danger',
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
      iconColor: 'text-warning',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-warning',
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
      iconColor: 'text-critical',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-critical',
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
      iconColor: 'text-caution',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-caution',
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
      iconColor: 'text-warning',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-warning',
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
      iconColor: 'text-caution',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-caution',
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
      iconColor: 'text-information',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'text-on-information',
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
      iconColor: 'text-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-danger',
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
      iconColor: 'text-information',
      stackedIcon: 'element-state-progress',
      stackedIconColor: 'text-on-information',
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
      iconColor: 'text-information',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'text-on-information',
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
      iconColor: 'text-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-danger'
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
        customClass: 'btn-tertiary-ghost',
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
