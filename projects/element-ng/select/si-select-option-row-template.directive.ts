/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SelectOption } from './si-select.types';

@Directive({
  selector: '[siSelectOptionRowTemplate]'
})
export class SiSelectOptionRowTemplateDirective {
  static ngTemplateContextGuard<T = any>(
    directive: SiSelectOptionRowTemplateDirective,
    context: unknown
  ): context is { $implicit: SelectOption<T> } {
    return true;
  }
}
