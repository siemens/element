/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { SiSummaryWidgetComponent } from '@spike-rabbit/element-ng/summary-widget';

@Component({
  selector: 'app-sample',
  imports: [NgTemplateOutlet, SiSummaryWidgetComponent],
  templateUrl: './si-summary-widget.html'
})
export class SampleComponent {}
