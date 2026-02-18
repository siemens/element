/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, model, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetConfig, WidgetConfigStatus, WidgetInstanceEditor } from '@siemens/dashboards-ng';

@Component({
  selector: 'app-note-widget-editor',
  imports: [FormsModule],
  templateUrl: './note-widget-editor.component.html'
})
export class NoteWidgetEditorComponent implements WidgetInstanceEditor, OnInit {
  readonly config = model.required<WidgetConfig | Omit<WidgetConfig, 'id'>>();

  readonly statusChanges = output<Partial<WidgetConfigStatus>>();

  protected heading = '';
  protected message = '';

  ngOnInit(): void {
    this.heading = this.config()?.heading ?? '';
    this.message = this.config()?.payload?.message ?? '';
  }

  onChange(): void {
    const config = this.config();
    config!.heading = this.heading ?? '';
    config!.payload.message = this.message ?? '';
    this.statusChanges.emit({ invalid: config!.heading.trim().length === 0, modified: true });
    this.config.set(config);
  }
}
