/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { ClusterPopoverContext } from './cluster-types';

/**
 * Template for custom location content inside `si-cluster-popover`.
 *
 * Receives a {@link ClusterPopoverContext} with all locations loaded so far. Loading feedback,
 * error recovery, and the "Load more" button are handled by the popover.
 *
 * @experimental
 */
@Directive({
  selector: '[siClusterPopoverTemplate]'
})
export class SiClusterPopoverTemplateDirective {
  /** @internal */
  static ngTemplateContextGuard(
    directive: SiClusterPopoverTemplateDirective,
    context: unknown
  ): context is ClusterPopoverContext {
    return true;
  }
}
