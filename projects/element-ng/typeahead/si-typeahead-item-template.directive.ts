/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { TypeaheadOptionItemContext } from './si-typeahead.model';

@Directive({
  selector: '[siTypeaheadItemTemplate]'
})
export class SiTypeaheadItemTemplateDirective {
  static ngTemplateContextGuard(
    dir: SiTypeaheadItemTemplateDirective,
    ctx: any
  ): ctx is TypeaheadOptionItemContext {
    return true;
  }
}
