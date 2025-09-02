/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, input, TemplateRef } from '@angular/core';

import { TreeItem } from './si-tree-view.model';

/**
 * Tree view item template directive for defining custom item templates.
 *
 * @deprecated Use `siTreeViewItem` instead.
 *
 * This directive is deprecated and will be removed in a future version.
 *
 * @example
 * Migration Guide:
 *
 * Before (deprecated):
 * ```html
 * <si-tree-view>
 *   <ng-template siTreeViewItemTemplate="root" let-item>
 *     <div class="custom-item">Root {{ item.level }}</div>
 *   </ng-template>
 *   <ng-template siTreeViewItemTemplate="child" let-item>
 *     <div class="custom-item">Child {{ item.level }}</div>
 *   </ng-template>
 * </si-tree-view>
 * ```
 *
 * After (recommended):
 * ```html
 * <si-tree-view>
 *   <ng-template siTreeViewItem let-item="treeItem">
 *     <si-tree-view-item>
 *      <div class="custom-item">
 *       @if (item.level === 0) {
 *         Root {{ item.level }}
 *       } @else {
 *         Child {{ item.level }}
 *       }
 *      </div>
 *     </si-tree-view-item>
 *   </ng-template>
 * </si-tree-view>
 * ```
 */
@Directive({
  selector: '[siTreeViewItemTemplate]'
})
export class SiTreeViewItemTemplateDirective {
  /** @defaultValue undefined */
  readonly name = input<string | undefined>(undefined, { alias: 'siTreeViewItemTemplate' });
  /** @internal */
  template = inject(TemplateRef<any>);

  static ngTemplateContextGuard(
    dir: SiTreeViewItemTemplateDirective,
    ctx: any
  ): ctx is { $implicit: TreeItem } {
    return true;
  }
}
