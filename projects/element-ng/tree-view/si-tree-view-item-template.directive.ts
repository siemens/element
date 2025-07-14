/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, input, TemplateRef } from '@angular/core';

import { TreeItem } from './si-tree-view.model';

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
