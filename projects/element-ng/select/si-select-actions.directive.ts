/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

@Directive({
  selector: '[siSelectActions]',
  exportAs: 'si-select-actions'
})
export class SiSelectActionsDirective {
  /** @internal */
  static ngTemplateContextGuard(
    directive: SiSelectActionsDirective,
    context: unknown
  ): context is { searchText?: string; visibleOptionsCount?: number } {
    return true;
  }
}
