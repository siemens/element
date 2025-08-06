/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SiCircleStatusModule } from '@spike-rabbit/element-ng/circle-status';
import { SiContentActionBarComponent } from '@spike-rabbit/element-ng/content-action-bar';
import { SiDashboardModule } from '@spike-rabbit/element-ng/dashboard';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';
import { SiSearchBarModule } from '@spike-rabbit/element-ng/search-bar';
import { SiTranslateModule } from '@spike-rabbit/element-translate-ng/translate';

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
