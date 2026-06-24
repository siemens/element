/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { elementDown2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

import { SiCustomSelectDirective } from './si-custom-select.directive';

/**
 * Visual trigger element for custom selects built with {@link SiCustomSelectDirective}.
 * Renders the projected content and a dropdown caret icon.
 *
 * The ARIA role, focus handling, and state attributes live on the host component
 * via {@link SiCustomSelectDirective} — this component is purely visual.
 *
 * @example
 * ```html
 * <si-select-combobox>
 *   {{ select.value() }}
 * </si-select-combobox>
 * ```
 *
 * @experimental
 */
@Component({
  selector: 'si-select-combobox',
  imports: [SiIconComponent],
  template: `
    <ng-content />
    <div class="form-control-actions ms-auto my-n4">
      <si-icon class="dropdown-caret icon flip-rtl p-0 m-0" [icon]="icons.elementDown2" />
    </div>
  `,
  styleUrl: './si-select-combobox.component.scss',
  host: {
    class: 'select dropdown-toggle d-flex align-items-center',
    '[attr.id]': 'customSelect.comboboxLabelId()',
    '[class.show]': 'customSelect.isOpen()'
  },
  hostDirectives: [{
    directive: SiCustomSelectDirective,
    inputs: ['disabled', 'readonly', 'value'],
    outputs: ['valueChange']
  }]
})
export class SiSelectComboboxComponent {
  protected readonly icons = addIcons({ elementDown2 });
  protected readonly customSelect = inject(SiCustomSelectDirective);
}
