/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiLinkDirective, SiSearchBarComponent],
  templateUrl: './si-list-widget-css.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  simplLink: Link = {
    title: 'Link',
    link: '/'
  };

  buildings = [
    { name: 'Building B', alarms: 2, value: '10.7' },
    { name: 'Building C', alarms: 2, value: '10.7' },
    { name: 'Building D', alarms: 3, value: '10.7' },
    { name: 'Building E', alarms: 5, value: '10.7' },
    { name: 'Building F', alarms: 5, value: '10.7' },
    { name: 'Building G', alarms: 6, value: '10.7' }
  ];

  primaryActions: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Sort up',
      icon: 'element-sort-up',
      iconOnly: true,
      action: () => this.logEvent('Sort up')
    }
  ];
}
