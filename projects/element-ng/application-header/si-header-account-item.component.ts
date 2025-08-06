/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiAvatarComponent } from '@spike-rabbit/element-ng/avatar';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';

import { SiHeaderActionIconItemBase } from './si-header-action-item-icon-base.directive';

/** Adds an account item to the header. Should be located inside `.header-actions`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-header-account-item]',
  imports: [SiAvatarComponent, SiIconNextComponent],
  templateUrl: './si-header-account-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'header-item focus-inside p-4',
    '[class.dropdown-toggle]': '!!dropdownTrigger'
  }
})
export class SiHeaderAccountItemComponent extends SiHeaderActionIconItemBase {
  /** Name of the account. */
  readonly name = input.required<string>();
  /** Initials of the account. If not provided, they will be calculated. */
  readonly initials = input<string>();
  /** URL to an image which should be shown instead of the initials. */
  readonly imageUrl = input<string>();
}
