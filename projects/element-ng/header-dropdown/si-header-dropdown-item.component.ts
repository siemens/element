/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { elementDown2, elementOk, elementRecordFilled } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

import { SiHeaderDropdownItemBase } from './si-header-dropdown-item-base.directive';

/**
 * Creates a dropdown-item. Must be used within an {@link SiHeaderDropdownComponent}.
 */
@Component({
  selector: 'si-header-dropdown-item, a[si-header-dropdown-item], button[si-header-dropdown-item]',
  imports: [SiIconComponent],
  templateUrl: './si-header-dropdown-item.component.html',
  styleUrl: './si-header-dropdown-item.component.scss',
  host: {
    class: 'dropdown-item focus-inside',
    '[attr.aria-pressed]': 'checked() ? "true" : null',
    '(click)': 'click()'
  }
})
export class SiHeaderDropdownItemComponent extends SiHeaderDropdownItemBase {
  protected readonly icons = addIcons({ elementDown2, elementOk, elementRecordFilled });

  /**
   * Whether the icon is checked with a radio or check mark.
   * @deprecated Use `si-header-dropdown-radio-item` or `si-header-dropdown-check-item` instead.
   */
  readonly checked = input<'radio' | 'check' | ''>();
}
