/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { ClusterPopoverContext } from './cluster-types';

/** Template for custom content inside `si-cluster-popover`. */
@Directive({
  selector: '[siMaplibreClusterPopover]'
})
export class SiMaplibreClusterPopoverDirective {
  /** @internal */
  static ngTemplateContextGuard(
    directive: SiMaplibreClusterPopoverDirective,
    context: unknown
  ): context is ClusterPopoverContext {
    return true;
  }
}
