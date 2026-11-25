/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, model } from '@angular/core';
import { elementDown2, elementRecordFilled } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

import { SiHeaderDropdownItemBase } from './si-header-dropdown-item-base.directive';

/** Creates a radio dropdown item. Must be used within an {@link SiHeaderDropdownComponent}. */
@Component({
  selector: 'si-header-dropdown-radio-item, a[si-header-dropdown-radio-item], button[si-header-dropdown-radio-item]',
  imports: [SiIconComponent],
  templateUrl: './si-header-dropdown-radio-item.component.html',
  styleUrl: './si-header-dropdown-item.component.scss',
  host: {
    class: 'dropdown-item focus-inside',
    role: 'radio',
    '[attr.aria-checked]': 'checked() ? "true" : "false"',
    '(click)': 'select()'
  }
})
export class SiHeaderDropdownRadioItemComponent extends SiHeaderDropdownItemBase {
  protected readonly icons = addIcons({ elementDown2, elementRecordFilled });
  /** Whether the radio item is checked. Supports two-way binding through `checkedChange`. */
  readonly checked = model.required<boolean>();

  protected select(): void {
    this.checked.set(true);
    this.click();
  }
}
