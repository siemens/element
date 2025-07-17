/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, output } from '@angular/core';
import { SiWidgetCatalogComponent, Widget, WidgetConfig } from '@siemens/dashboards-ng';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { HELLO_DESCRIPTOR } from '../../widgets/hello-widget/widget-descriptors';

@Component({
  selector: 'app-widget-catalog',
  imports: [SiCircleStatusComponent, SiTranslatePipe],
  templateUrl: './custom-widget-catalog.component.html',
  styleUrl: './custom-widget-catalog.component.scss'
})
export class CustomWidgetCatalogComponent extends SiWidgetCatalogComponent {
  override readonly closed = output<Omit<WidgetConfig, 'id'> | undefined>();

  override widgetCatalog: Widget[] = [];

  myDescriptor = HELLO_DESCRIPTOR;

  override onCancel(): void {
    this.closed.emit(undefined);
  }

  override onAddWidget(): void {
    const selected = this.selected();
    if (selected) {
      const widgetConfig: Omit<WidgetConfig, 'id'> = {
        heading: selected.name,
        widgetId: selected.id,
        version: selected.version,
        minWidth: 3,
        ...selected.defaults,
        payload: { ...selected.payload }
      };
      this.closed.emit(widgetConfig);
    }
  }

  trackByIndex = (index: number): number => index;
}
