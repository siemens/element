/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, input } from '@angular/core';

import { SiHeaderDropdownTriggerDirective } from './si-header-dropdown-trigger.directive';
import { SI_HEADER_WITH_DROPDOWNS } from './si-header.model';

@Directive()
export abstract class SiHeaderDropdownItemBase {
  /** Optional icon that will be rendered before the label. */
  readonly icon = input<string>();
  /** Badge that is rendered after the label. */
  readonly badge = input<string | number>();
  /** Badge (always red) that is attached to the icon. */
  readonly iconBadge = input<string | number>();
  /** Color of the badge (not iconBadge). */
  readonly badgeColor = input<string>();

  protected readonly ownTrigger = inject(SiHeaderDropdownTriggerDirective, {
    self: true,
    optional: true
  });
  protected readonly parentTrigger = inject(SiHeaderDropdownTriggerDirective, { skipSelf: true });
  protected readonly navbar = inject(SI_HEADER_WITH_DROPDOWNS, { optional: true });

  protected click(): void {
    if (!this.ownTrigger) {
      this.parentTrigger.close({ all: true });
      this.navbar?.onDropdownItemTriggered?.();
    }
  }
}
