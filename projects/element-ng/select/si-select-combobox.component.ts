/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
 */
@Component({
  selector: 'si-select-combobox',
  imports: [SiIconComponent],
  template: `
    <div class="d-flex align-items-center flex-fill overflow-hidden text-truncate">
      <ng-content />
    </div>
    <si-icon class="dropdown-caret icon flip-rtl" [icon]="icons.elementDown2" />
  `,
  styleUrl: './si-select-combobox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'select focus-none dropdown-toggle d-flex align-items-center',
    '[class.show]': 'customSelect.isOpen()'
  }
})
export class SiSelectComboboxComponent {
  protected readonly icons = addIcons({ elementDown2 });
  protected customSelect = inject(SiCustomSelectDirective);
}
