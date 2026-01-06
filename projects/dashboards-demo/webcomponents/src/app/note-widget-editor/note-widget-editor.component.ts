/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, Input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetConfig, WidgetConfigStatus, WidgetInstanceEditor } from '@siemens/dashboards-ng';

@Component({
  selector: 'app-note-widget-editor',
  imports: [FormsModule],
  templateUrl: './note-widget-editor.component.html'
})
export class NoteWidgetEditorComponent implements WidgetInstanceEditor, OnInit {
  @Input() config!: WidgetConfig | Omit<WidgetConfig, 'id'>;
  readonly statusChanges = output<Partial<WidgetConfigStatus>>();

  protected heading = '';
  protected message = '';

  ngOnInit(): void {
    this.heading = this.config?.heading ?? '';
    this.message = this.config?.payload?.message ?? '';
  }

  onChange(): void {
    this.config!.heading = this.heading ?? '';
    this.config!.payload.message = this.message ?? '';
    this.statusChanges.emit({ invalid: this.config!.heading.trim().length === 0, modified: true });
  }
}
