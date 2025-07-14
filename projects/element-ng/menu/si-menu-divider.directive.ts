/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

@Directive({
  // violating eslint rule, to a have clean API
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-menu-divider',
  host: {
    class: 'd-block dropdown-divider'
  }
})
export class SiMenuDividerDirective {}
