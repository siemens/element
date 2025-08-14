/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { MapPointMetaData } from '../../models';

@Directive({
  selector: `[siMapPopoverTemplate]`
})
export class SiMapPopoverTemplateDirective {
  static ngTemplateContextGuard(
    directive: SiMapPopoverTemplateDirective,
    context: unknown
  ): context is { mapPoint: MapPointMetaData } {
    return true;
  }
}
