/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Filter, SiFilterBarComponent } from '@siemens/element-ng/filter-bar';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiFilterBarComponent],
  templateUrl: './si-filter-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  filters: Filter[] = [
    {
      filterName: 'temperature',
      title: 'Temperature',
      description: '30°'
    },
    {
      filterName: 'time',
      title: 'Time',
      description: '10:10 AM'
    },
    {
      filterName: 'date',
      title: 'Date',
      description: '27-12-2022'
    },
    {
      filterName: 'company',
      title: 'Company',
      description: 'Siemens'
    },
    {
      filterName: 'location',
      title: 'Location',
      description: 'Zug'
    },
    {
      filterName: 'only-key',
      title: 'Only Key',
      description: ''
    },
    {
      filterName: 'only-value',
      title: '',
      description: 'Only Value'
    }
  ];
}
