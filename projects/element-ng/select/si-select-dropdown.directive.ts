/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, TemplateRef } from '@angular/core';

import { SiCustomSelectDirective } from './si-custom-select.directive';

/**
 * Structural directive marking the dropdown template for custom selects
 * built with {@link SiCustomSelectDirective}.
 *
 * When placed on an `<ng-template>`, it automatically registers the template
 * with the parent {@link SiCustomSelectDirective}.
 *
 * @example
 * ```html
 * <ng-template si-select-dropdown>
 *   <!-- custom dropdown content -->
 * </ng-template>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[si-select-dropdown]'
})
export class SiSelectDropdownDirective {
  constructor() {
    const templateRef = inject<TemplateRef<void>>(TemplateRef);
    const customSelect = inject(SiCustomSelectDirective, { optional: true });
    customSelect?.registerDropdownTemplate(templateRef);
  }
}
