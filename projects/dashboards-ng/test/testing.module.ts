/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SiCircleStatusModule } from '@siemens/element-ng/circle-status';
import { SiContentActionBarComponent } from '@siemens/element-ng/content-action-bar';
import { SiDashboardModule } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiSearchBarModule } from '@siemens/element-ng/search-bar';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { Widget } from '../src/model/widgets.model';

export const createTestingWidget = (
  name: string,
  id: string,
  componentName?: string,
  editorComponentName?: string
): Widget => ({
  id,
  name,
  componentFactory: {
    componentName: componentName ?? '',
    editorComponentName: editorComponentName ?? '',
    moduleName: componentName ? componentName + 'Module' : '',
    moduleLoader: () => Promise.reject()
  }
});

@NgModule({
  imports: [
    CommonModule,
    SiCircleStatusModule,
    SiContentActionBarComponent,
    SiDashboardModule,
    SiEmptyStateComponent,
    SiSearchBarModule,
    SiTranslateModule
  ],
  exports: [
    CommonModule,
    SiCircleStatusModule,
    SiContentActionBarComponent,
    SiDashboardModule,
    SiEmptyStateComponent,
    SiSearchBarModule,
    SiTranslateModule
  ]
})
export class TestingModule {}
