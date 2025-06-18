/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, IterableChangeRecord } from '@angular/core';

import type { SiTreeViewComponent } from './si-tree-view.component';
import type { TreeItem } from './si-tree-view.model';

export const TREE_ITEM_CONTEXT = new InjectionToken<{
  record: IterableChangeRecord<TreeItem<any>>;
  parent: SiTreeViewComponent;
}>('TREE_ITEM_CONTEXT');
