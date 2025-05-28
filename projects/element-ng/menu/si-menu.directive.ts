/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenu, CdkTargetMenuAim } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
  // violating eslint rule, to a have clean API
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-menu',
  hostDirectives: [CdkMenu, CdkTargetMenuAim],
  host: {
    class: 'd-block dropdown-menu position-static'
  }
})
export class SiMenuDirective {}
