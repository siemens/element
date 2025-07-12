/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { DatePipe, JsonPipe } from '@angular/common';
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
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { LOG_EVENT } from '@siemens/live-preview';

const ONE_DAY = 60 * 60 * 24 * 1000;

@Component({
  selector: 'app-sample',
  imports: [
    A11yModule,
    DatePipe,
    FormsModule,
    JsonPipe,
    OverlayModule,
    SiDateRangeFilterComponent,
    SiFormItemComponent
  ],
  templateUrl: './si-date-range-filter-popup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly service = inject(SiDateRangeCalculationService);
  private readonly cdRef = inject(ChangeDetectorRef);

  protected open = false;
  protected enableTimeSelection = false;
  protected inputMode = false;
  protected showPresets = true;
  protected showApply = false;
  protected resolved?: ResolvedDateRange;

  protected range: DateRangeFilter = {
    point1: 'now',
    point2: 31 * ONE_DAY,
    range: 'before'
  };

  protected readonly presetList: DateRangePreset[] = [
    { label: 'last minute', offset: 1000 * 60 },
    { label: 'last hour', offset: 1000 * 60 * 60 },
    { label: 'last 24h', offset: ONE_DAY },
    { label: 'last 7 days', offset: ONE_DAY * 7 },
    { label: 'last 30 days', offset: ONE_DAY * 30 },
    { label: 'last 60 days', offset: ONE_DAY * 60 },
    { label: 'last 90 days', offset: ONE_DAY * 90 },
    { label: 'last year', offset: ONE_DAY * 365 }
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
