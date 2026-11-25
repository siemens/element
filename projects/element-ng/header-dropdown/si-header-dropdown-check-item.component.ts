/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, model } from '@angular/core';
import { elementDown2, elementOk } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

import { SiHeaderDropdownItemBase } from './si-header-dropdown-item-base.directive';

/** Creates a check dropdown item. Must be used within an {@link SiHeaderDropdownComponent}. */
@Component({
  selector: 'si-header-dropdown-check-item, a[si-header-dropdown-check-item], button[si-header-dropdown-check-item]',
  imports: [SiIconComponent],
  templateUrl: './si-header-dropdown-check-item.component.html',
  styleUrl: './si-header-dropdown-item.component.scss',
  host: {
    class: 'dropdown-item focus-inside',
    role: 'checkbox',
    '[attr.aria-checked]': 'checked() ? "true" : "false"',
    '(click)': 'toggle()'
  }
})
export class SiHeaderDropdownCheckItemComponent extends SiHeaderDropdownItemBase {
  protected readonly icons = addIcons({ elementDown2, elementOk });
  /** Whether the check item is checked. Supports two-way binding through `checkedChange`. */
  readonly checked = model.required<boolean>();

  protected toggle(): void {
    this.checked.update(checked => !checked);
    this.click();
  }
}
