/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { SiFlexibleDashboardComponent, Widget } from '@siemens/dashboards-ng';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';

import { AppStateService } from '../../app-state.service';
import { CustomWidgetCatalogComponent } from '../../components/widget-catalog/custom-widget-catalog.component';
import { HELLO_DESCRIPTOR } from '../../widgets/hello-widget/widget-descriptors';

const EMPTY_TEXT =
  'No widgets have been added yet. Start right now and discover the world of widgets.';
const EMPTY_TEXT_EDIT = 'Use the widget catalog to add widgets.';

@Component({
  selector: 'app-custom-catalog',
  imports: [SiFlexibleDashboardComponent, SiEmptyStateComponent],
  templateUrl: './custom-catalog.component.html',
  styleUrl: './custom-catalog.component.scss'
})
export class CustomCatalogPageComponent {
  appStateService = inject(AppStateService);
  customWidgetCatalogComponent = CustomWidgetCatalogComponent;
  widgetCatalog: Widget[] = [HELLO_DESCRIPTOR];
  emptyIcon = 'element-dashboard';
  emptyText = EMPTY_TEXT;

  onEditableChange(editable: boolean): void {
    this.emptyText = editable ? EMPTY_TEXT_EDIT : EMPTY_TEXT;
    this.emptyIcon = editable ? 'element-plus' : 'element-dashboard';
  }
}
