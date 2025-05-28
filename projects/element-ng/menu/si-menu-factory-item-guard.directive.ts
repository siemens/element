/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';

import { MenuItem } from './si-menu-model';

/** Required to have compiler checks on the factory template */
@Directive({ selector: '[siMenuFactoryItemGuard]' })
export class SiMenuFactoryItemGuardDirective {
  static ngTemplateContextGuard(
    dir: SiMenuFactoryItemGuardDirective,
    ctx: any
  ): ctx is { $implicit: MenuItemLegacy | MenuItem } {
    return true;
  }
}
