/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetConfig, WidgetConfigStatus, WidgetInstanceEditor } from '@siemens/dashboards-ng';
@Component({
  selector: 'app-hello-widget-editor',
  imports: [FormsModule],
  templateUrl: './hello-widget-editor.component.html'
})
export class HelloWidgetEditorComponent implements WidgetInstanceEditor {
  readonly config = model.required<WidgetConfig | Omit<WidgetConfig, 'id'>>();
  readonly statusChanges = output<Partial<WidgetConfigStatus>>();
  readonly configChange = output<WidgetConfig | Omit<WidgetConfig, 'id'>>();

  onChange(): void {
    const config = this.config();
    config!.heading = config!.heading ?? '';
    config!.payload.message = config!.payload.message ?? '';
    this.statusChanges.emit({
      invalid: config!.heading.trim().length === 0
    });
    this.config.set(config);
    this.configChange.emit(config);
  }
}
