/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, TemplateRef, ViewChild } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { SiTimelineWidgetBodyComponent, SiTimelineWidgetItem } from '@siemens/element-ng/dashboard';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';

@Component({
  selector: 'app-timeline-widget',
  imports: [SiTimelineWidgetBodyComponent, SiLinkDirective],
  template: `
    <si-timeline-widget-body [value]="timelineWidgetValue">
      <ng-template #footer>
        <a [siLink]="link">Go to...</a>
      </ng-template>
    </si-timeline-widget-body>
  `
})
export class TimelineWidgetComponent implements WidgetInstance {
  readonly config = input.required<WidgetConfig>();
  protected timelineWidgetValue: SiTimelineWidgetItem[] = [
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
  @ViewChild('footer', { static: true }) footer?: TemplateRef<unknown>;

  protected link?: Link = { href: 'https://github.com/siemens/element/issues' };
}
