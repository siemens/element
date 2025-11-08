/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SiSummaryWidgetComponent } from '@siemens/element-ng/summary-widget';

@Component({
  selector: 'app-sample',
  imports: [NgTemplateOutlet, SiSummaryWidgetComponent],
  templateUrl: './si-summary-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
