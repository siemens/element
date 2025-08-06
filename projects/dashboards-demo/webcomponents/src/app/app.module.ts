/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DoBootstrap, inject, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SimplChartsNgModule, themeElement, themeSupport } from '@spike-rabbit/charts-ng';
import { SiResizeObserverModule } from '@spike-rabbit/element-ng/resize-observer';
import { SiThemeService } from '@spike-rabbit/element-ng/theme';

import { ChartWidgetComponent } from './chart-widget/chart-widget.component';
import { ContactWidgetEditorComponent } from './contact-widget-editor/contact-widget-editor.component';
import { ContactWidgetComponent } from './contact-widget/contact-widget.component';
import { NoteWidgetEditorComponent } from './note-widget-editor/note-widget-editor.component';
import { NoteWidgetComponent } from './note-widget/note-widget.component';

themeSupport.setDefault(themeElement);
@NgModule({
  imports: [
    BrowserModule,
    ChartWidgetComponent,
    FormsModule,
    NoteWidgetComponent,
    NoteWidgetEditorComponent,
    ContactWidgetComponent,
    ContactWidgetEditorComponent,
    SimplChartsNgModule,
    SiResizeObserverModule
  ],
  providers: [SiThemeService],
  bootstrap: []
})
export class AppModule implements DoBootstrap {
  private injector = inject(Injector);

  ngDoBootstrap(): void {
    customElements.define(
      'note-widget',
      createCustomElement(NoteWidgetComponent, { injector: this.injector })
    );
    customElements.define(
      'note-widget-editor',
      createCustomElement(NoteWidgetEditorComponent, { injector: this.injector })
    );
    customElements.define(
      'chart-widget',
      createCustomElement(ChartWidgetComponent, { injector: this.injector })
    );
    customElements.define(
      'contact-widget',
      createCustomElement(ContactWidgetComponent, { injector: this.injector })
    );
    customElements.define(
      'contact-widget-editor',
      createCustomElement(ContactWidgetEditorComponent, { injector: this.injector })
    );
  }
}
