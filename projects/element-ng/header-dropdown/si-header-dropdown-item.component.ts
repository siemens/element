/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, input } from '@angular/core';

import { SiHeaderDropdownTriggerDirective } from './si-header-dropdown-trigger.directive';
import { SI_HEADER_WITH_DROPDOWNS } from './si-header.model';

/**
 * Creates a dropdown-item. Must be used within an {@link SiHeaderDropdownComponent}.
 */
@Component({
  selector: 'si-header-dropdown-item, a[si-header-dropdown-item], button[si-header-dropdown-item]',
  imports: [NgClass],
  templateUrl: './si-header-dropdown-item.component.html',
  styleUrl: './si-header-dropdown-item.component.scss',
  host: {
    class: 'dropdown-item focus-inside'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiHeaderDropdownItemComponent {
  /** Optional icon that will be rendered before the label. */
  readonly icon = input<string>();
  /** Badge that is rendered after the label. */
  readonly badge = input<string | number>();
  /** Badge (always red) that is attached to the icon. */
  readonly iconBadge = input<string | number>();
  /** Color of the badge (not iconBadge). */
  readonly badgeColor = input<string>();
  /** Whether the icon is checked with a radio or check mark. */
  readonly checked = input<'radio' | 'check' | ''>();

  protected readonly ownTrigger = inject(SiHeaderDropdownTriggerDirective, {
    self: true,
    optional: true
  });
  protected readonly parentTrigger = inject(SiHeaderDropdownTriggerDirective, { skipSelf: true });
  protected readonly navbar = inject(SI_HEADER_WITH_DROPDOWNS, { optional: true });

  @HostListener('click')
  protected click(): void {
    if (!this.ownTrigger) {
      this.parentTrigger.close({ all: true });
      if (this.navbar?.onDropdownItemTriggered) {
        this.navbar?.onDropdownItemTriggered();
      }
    }
  }
}
