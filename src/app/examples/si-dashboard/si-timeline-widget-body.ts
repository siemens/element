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
import {
  SiTimelineWidgetBodyComponent,
  SiTimelineWidgetItem
} from '@spike-rabbit/element-ng/dashboard';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiTimelineWidgetBodyComponent, SiEmptyStateComponent],
  templateUrl: './si-timeline-widget-body.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast',
      action: {
        type: 'action',
        label: 'Copy',
        icon: 'element-copy',
        customClass: 'btn-ghost',
        action: item => this.logEvent(`Action clicked: ${item.label}`)
      }
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-triangle-filled',
      iconColor: 'status-warning',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-warning-contrast'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-octagon-filled',
      iconColor: 'status-critical',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-critical-contrast'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-45-filled',
      iconColor: 'status-caution',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-caution-contrast'
    }
  ];

  historyItemsC?: SiTimelineWidgetItem[];

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
      stackedIconColor: 'status-caution-contrast'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-square-filled',
      iconColor: 'status-info',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'status-info-contrast'
    },
    {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast'
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
      stackedIconColor: 'status-info-contrast'
    },
    {
      timeStamp: 'Today 14:28',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      icon: 'element-square-filled',
      iconColor: 'status-info',
      stackedIcon: 'element-state-info',
      stackedIconColor: 'status-info-contrast'
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
