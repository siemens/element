/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';

@Component({
  selector: 'app-sample',
  templateUrl: './si-summary-chip.html',
  imports: [NgTemplateOutlet, SiSummaryChipComponent]
})
export class SampleComponent {}
