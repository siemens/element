/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HelloWidgetEditorComponent } from './hello-widget-editor.component';
import { HelloWidgetComponent } from './hello-widget.component';

@NgModule({
  imports: [CommonModule, FormsModule, HelloWidgetComponent, HelloWidgetEditorComponent],
  exports: [HelloWidgetComponent, HelloWidgetEditorComponent]
})
export class HelloWidgetModule {}
