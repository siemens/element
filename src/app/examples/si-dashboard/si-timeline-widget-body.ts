/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SiTimelineWidgetBodyComponent, SiTimelineWidgetItem } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiTimelineWidgetBodyComponent, SiEmptyStateComponent],
  templateUrl: './si-timeline-widget-body.html',
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  logEvent = inject(LOG_EVENT);
  private cdRef = inject(ChangeDetectorRef);

  historyItemsA: SiTimelineWidgetItem[] = [];

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
        type: 'action',
        label: 'Copy',
        icon: 'element-copy',
        customClass: 'btn-tertiary-ghost',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-triangle-filled',
      iconColor: 'text-warning',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-warning'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-octagon-filled',
      iconColor: 'text-critical',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-critical'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-45-filled',
      iconColor: 'text-caution',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-caution'
    }
  ];

  historyItemsC?: SiTimelineWidgetItem[];

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
      stackedIconColor: 'text-on-caution'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-filled',
      iconColor: 'text-information',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'text-on-information'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-circle-filled',
      iconColor: 'text-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'text-on-danger'
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
      stackedIconColor: 'text-on-information'
    },
    {
      timeStamp: 'Today 14:28',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      icon: 'element-square-filled',
      iconColor: 'text-information',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'text-on-information'
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
      icon: 'element-sun'
    },
    {
      timeStamp: 'Today 09:21',
      title: 'Title',
      icon: 'element-cloudy'
    },
    {
      timeStamp: 'Yesterday 17:59',
      title: 'Title',
      icon: 'element-rain'
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
