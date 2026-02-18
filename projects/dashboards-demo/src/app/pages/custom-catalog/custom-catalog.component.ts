/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  DashboardToolbarItem,
  SI_WIDGET_STORE,
  SiFlexibleDashboardComponent,
  SiGridComponent,
  Widget
} from '@siemens/dashboards-ng';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';

import { AppStateService } from '../../app-state.service';
import { AppWidgetStorage } from '../../app-widget-storage';
import { CustomWidgetCatalogComponent } from '../../components/widget-catalog/custom-widget-catalog.component';
import { HELLO_DESCRIPTOR } from '../../widgets/hello-widget/widget-descriptors';

const EMPTY_TEXT =
  'No widgets have been added yet. Start right now and discover the world of widgets.';
const EMPTY_TEXT_EDIT = 'Use the widget catalog to add widgets.';

@Component({
  selector: 'app-custom-catalog',
  imports: [SiFlexibleDashboardComponent, SiEmptyStateComponent],
  templateUrl: './custom-catalog.component.html',
  styleUrl: './custom-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomCatalogPageComponent {
  appStateService = inject(AppStateService);
  customWidgetCatalogComponent = CustomWidgetCatalogComponent;
  widgetCatalog: Widget[] = [HELLO_DESCRIPTOR];
  emptyIcon = 'element-dashboard';
  emptyText = EMPTY_TEXT;

  protected secondaryMenuItems: DashboardToolbarItem[] = [
    {
      type: 'action',
      label: 'TOOLBAR.RESTORE_DEFAULTS',
      action: (grid: SiGridComponent) => this.widgetStore.restoreDefaults('custom-library')
    },
    {
      type: 'action',
      label: 'TOOLBAR.SAVE_AS_DEFAULTS',
      action: (grid: SiGridComponent) => this.widgetStore.saveAsDefaults(grid)
    }
  ];
  protected primaryMenuItems: DashboardToolbarItem[] = [
    {
      type: 'action',
      label: 'Custom Action',
      action: (grid: SiGridComponent) =>
        alert(`Grid has ${grid.visibleWidgetInstances$.value.length} widgets!`)
    }
  ];

  private widgetStore = inject<AppWidgetStorage>(SI_WIDGET_STORE);

  onEditableChange(editable: boolean): void {
    this.emptyText = editable ? EMPTY_TEXT_EDIT : EMPTY_TEXT;
    this.emptyIcon = editable ? 'element-plus' : 'element-dashboard';
  }
}
