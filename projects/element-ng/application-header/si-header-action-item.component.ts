/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';

import { SiHeaderActionIconItemBase } from './si-header-action-item-icon-base.directive';

/** Adds an action item to the header. Should be located inside `.header-actions`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-header-action-item], a[si-header-action-item]',
  imports: [SiIconNextComponent],
  templateUrl: './si-header-action-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'header-item focus-inside',
    '[class.dropdown-toggle]': '!!dropdownTrigger'
  }
})
export class SiHeaderActionItemComponent extends SiHeaderActionIconItemBase {
  /** The icon to be shown. */
  readonly icon = input.required<string>();
}
