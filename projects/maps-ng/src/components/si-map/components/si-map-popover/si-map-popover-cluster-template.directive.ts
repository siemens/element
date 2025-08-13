/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { MapPointMetaData } from '../../models';

@Directive({
  selector: `[siMapPopoverClusterTemplate]`
})
export class SiMapPopoverClusterTemplateDirective {
  static ngTemplateContextGuard(
    directive: SiMapPopoverClusterTemplateDirective,
    context: unknown
  ): context is { mapPoints: MapPointMetaData[] } {
    return true;
  }
}
