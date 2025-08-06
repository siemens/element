/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { SiSummaryChipComponent } from '@spike-rabbit/element-ng/summary-chip';

@Component({
  selector: 'app-sample',
  imports: [NgTemplateOutlet, SiSummaryChipComponent],
  templateUrl: './si-summary-chip.html'
})
export class SampleComponent {}
