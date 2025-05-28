/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { SiSummaryWidgetComponent } from '@siemens/element-ng/summary-widget';

@Component({
  selector: 'app-sample',
  templateUrl: './si-summary-widget.html',
  imports: [NgTemplateOutlet, SiSummaryWidgetComponent]
})
export class SampleComponent {}
