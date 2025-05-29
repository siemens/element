/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject } from '@angular/core';

import { PopoverComponent } from './si-popover.component';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-popover-title',
  host: {
    '[id]': 'this.popover.labelledBy'
  }
})
export class SiPopoverTitleDirective {
  readonly popover = inject(PopoverComponent);
}
