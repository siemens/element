/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiSourceChipComponent, type SourceReference } from '@siemens/element-ng/source-chip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiSourceChipComponent],
  templateUrl: './si-source-chip.html'
})
export class SampleComponent {
  protected logEvent = inject(LOG_EVENT);

  protected readonly compactSources: SourceReference[] = [
    {
      name: 'Comprehensive annual operational performance and sustainability report',
      url: 'https://example.com/annual-report',
      description: 'Annual summary of operational and sustainability performance.'
    }
  ];

  protected readonly compactMultipleSources: SourceReference[] = [
    {
      name: 'Maintenance status',
      url: 'https://example.com/maintenance-status',
      description: 'Current status of scheduled maintenance work.'
    },
    {
      name: 'Service log',
      url: 'https://example.com/service-log',
      description: 'Completed service activities for this asset.'
    },
    {
      name: 'Inspection report',
      url: 'https://example.com/inspection-report',
      description: 'Latest inspection findings and recommended actions.'
    }
  ];

  protected readonly labelledSources: SourceReference[] = [
    {
      name: 'Operations dashboard',
      url: 'https://example.com/operations',
      description: 'Current production and service performance metrics.'
    },
    {
      name: 'Maintenance log',
      url: 'https://example.com/maintenance',
      description: 'Completed and scheduled maintenance activities.'
    },
    {
      name: 'Safety report',
      url: 'https://example.com/safety',
      description: 'Safety observations and corrective actions.'
    }
  ];
}
