/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DateRangeFilter,
  DateRangePreset,
  ResolvedDateRange,
  SiDateRangeCalculationService,
  SiDateRangeFilterComponent
} from '@siemens/element-ng/date-range-filter';
import { LOG_EVENT } from '@siemens/live-preview';

const ONE_DAY = 60 * 60 * 24 * 1000;

@Component({
  selector: 'app-sample',
  imports: [CommonModule, FormsModule, SiDateRangeFilterComponent],
  templateUrl: './si-date-range-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  protected logEvent = inject(LOG_EVENT);
  protected service = inject(SiDateRangeCalculationService);
  private cdRef = inject(ChangeDetectorRef);

  protected enableTimeSelection = false;
  protected inputMode = false;
  protected showPresets = true;
  protected showApply = false;
  protected hideAdvanced = false;
  protected reverseInputFields = false;
  protected resolved?: ResolvedDateRange;

  protected range: DateRangeFilter = {
    point1: new Date('2024-08-17'),
    point2: new Date('2024-04-05')
  };

  protected presetList: DateRangePreset[] = [
    { label: 'last minute', offset: 1000 * 60 },
    { label: 'last hour', offset: 1000 * 60 * 60 },
    { label: 'last 24h', offset: ONE_DAY },
    { label: 'last 7 days', offset: ONE_DAY * 7 },
    { label: 'last 30 days', offset: ONE_DAY * 30 },
    { label: 'last 60 days', offset: ONE_DAY * 60 },
    { label: 'last 90 days', offset: ONE_DAY * 90 },
    { label: 'last year', offset: ONE_DAY * 365 },
    {
      type: 'custom',
      label: 'past month',
      calculate: () => {
        const now = new Date();
        return {
          point1: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          point2: new Date(now.getFullYear(), now.getMonth(), 0)
        };
      }
    }
  ];

  ngOnInit(): void {
    this.updateResolved();
  }

  protected updateResolved(): void {
    this.resolved = this.service.resolveDateRangeFilter(this.range, {
      withTime: this.enableTimeSelection
    });
    this.cdRef.markForCheck();
  }
}
