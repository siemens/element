/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject } from '@angular/core';

import { PopoverComponent } from './si-popover.component';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-popover-body',
  host: {
    '[id]': 'this.popover.describedBy',
    'class': 'popover-body d-block'
  }
})
export class SiPopoverBodyDirective {
  readonly popover = inject(PopoverComponent);
}
