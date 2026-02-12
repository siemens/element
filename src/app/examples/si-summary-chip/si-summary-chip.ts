/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';

@Component({
  selector: 'app-sample',
  imports: [NgTemplateOutlet, SiSummaryChipComponent],
  templateUrl: './si-summary-chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
