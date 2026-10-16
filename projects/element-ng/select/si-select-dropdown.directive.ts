/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, input, TemplateRef } from '@angular/core';

import { SiCustomSelectDirective } from './si-custom-select.directive';

/**
 * Possible values for the `aria-haspopup` attribute exposed by the
 * combobox host of a custom select.
 */
export type SiSelectDropdownContentType =
  | 'false'
  | 'true'
  | 'menu'
  | 'listbox'
  | 'tree'
  | 'grid'
  | 'dialog';

/**
 * Structural directive marking the dropdown template for custom selects
 * built with {@link SiCustomSelectDirective}.
 *
 * When placed on an `<ng-template>`, it automatically registers the template
 * with the parent {@link SiCustomSelectDirective}.
 *
 * @example
 * ```html
 * <ng-template si-select-dropdown contentType="listbox">
 *   <!-- custom dropdown content -->
 * </ng-template>
 * ```
 *
 * @experimental
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[si-select-dropdown]'
})
export class SiSelectDropdownDirective {
  /**
   * Describes the kind of content rendered by the dropdown. The value is
   * forwarded to the `aria-haspopup` attribute of the combobox host of
   * the parent {@link SiCustomSelectDirective}.
   */
  readonly contentType = input.required<SiSelectDropdownContentType>();

  /** @internal */
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);

  constructor() {
    const customSelect = inject(SiCustomSelectDirective, { optional: true });
    customSelect?.registerDropdown(this);
  }
}
