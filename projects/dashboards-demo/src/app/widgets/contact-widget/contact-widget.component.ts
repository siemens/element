/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
@Component({
  selector: 'app-contact-widget',
  imports: [DatePipe],
  templateUrl: './contact-widget.component.html',
  styleUrl: './contact-widget.component.scss'
})
export class ContactWidgetComponent implements WidgetInstance {
  readonly config = input.required<WidgetConfig>();
}
