/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { EnumeratedBreadcrumbItem } from './breadcrumb-item.model';

@Directive({ selector: '[siBreadcrumbItemTemplate]' })
export class SiBreadcrumbItemTemplateDirective {
  static ngTemplateContextGuard(
    directive: SiBreadcrumbItemTemplateDirective,
    context: unknown
  ): context is { item: EnumeratedBreadcrumbItem; title?: string } {
    return true;
  }
}
