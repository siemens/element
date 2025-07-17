/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContactWidgetEditorComponent } from './contact-widget-editor.component';
import { ContactWidgetComponent } from './contact-widget.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ContactWidgetComponent,
    ContactWidgetEditorComponent,
    ReactiveFormsModule
  ],
  exports: [ContactWidgetComponent, ContactWidgetEditorComponent]
})
export class ContactWidgetModule {}
