/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetConfig, WidgetInstanceEditor } from '@siemens/dashboards-ng';
@Component({
  selector: 'si-test-widget-editor',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './test-widget-editor.component.html'
})
export class TestWidgetEditorComponent implements WidgetInstanceEditor, OnInit {
  @Input() config!: WidgetConfig | Omit<WidgetConfig, 'id'>;

  /** @defaultValue '' */
  heading = '';
  /** @defaultValue '' */
  message = '';

  ngOnInit(): void {
    this.heading = this.config?.heading ?? '';
    this.message = this.config?.payload?.message ?? '';
  }

  onChange(): void {
    this.config!.heading = this.heading ?? '';
    this.config!.payload.message = this.message ?? '';
  }
}
