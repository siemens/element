/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTranslateModule } from '@spike-rabbit/element-translate-ng/translate';

import { TestWidgetEditorComponent } from './test-widget-editor.component';
import { TestWidgetComponent } from './test-widget.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SiTranslateModule,
    TestWidgetComponent,
    TestWidgetEditorComponent
  ],
  exports: [TestWidgetComponent, TestWidgetEditorComponent]
})
export class TestWidgetModule {}
