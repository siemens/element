/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';

import { SiTreeViewItemTemplateDirective } from './si-tree-view-item-template.directive';
import { SiTreeViewItemComponent } from './si-tree-view-item/si-tree-view-item.component';
import { SiTreeViewItemDirective } from './si-tree-view-item/si-tree-view-item.directive';
import { SiTreeViewComponent } from './si-tree-view.component';

@NgModule({
  imports: [
    SiTreeViewComponent,
    SiTreeViewItemComponent,
    SiTreeViewItemDirective,
    SiTreeViewItemTemplateDirective
  ],
  exports: [
    SiTreeViewComponent,
    SiTreeViewItemComponent,
    SiTreeViewItemDirective,
    SiTreeViewItemTemplateDirective
  ]
})
export class SiTreeViewModule {}
