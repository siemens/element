/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';

import { SiHeaderActionItemBase } from './si-header-action-item.base';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-header-selection-item]',
  imports: [SiIconNextComponent],
  templateUrl: './si-header-selection-item.component.html',
  host: {
    class: 'header-item header-selection-item focus-inside dropdown-toggle',
    '[class.show]': 'open()'
  }
})
export class SiHeaderSelectionItemComponent extends SiHeaderActionItemBase {
  /**
   * Sets the open state which will only affect the arrow. Only use this property when not using {@link SiHeaderDropdownTriggerDirective}.
   *
   * @defaultValue false
   */
  readonly open = input(false);
}
