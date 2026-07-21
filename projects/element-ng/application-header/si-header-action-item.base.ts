/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, OnInit } from '@angular/core';
import { elementDown2 } from '@siemens/element-icons';
import { SiHeaderDropdownTriggerDirective } from '@siemens/element-ng/header-dropdown';
import { addIcons } from '@siemens/element-ng/icon';

import { SiApplicationHeaderComponent } from './si-application-header.component';
import { SiHeaderCollapsibleActionsComponent } from './si-header-collapsible-actions.component';

@Directive({
  host: {
    '(click)': 'click()'
  }
})
export abstract class SiHeaderActionItemBase implements OnInit {
  /** @internal */
  readonly dropdownTrigger = inject(SiHeaderDropdownTriggerDirective, {
    self: true,
    optional: true
  });
  protected readonly collapsibleActions = inject(SiHeaderCollapsibleActionsComponent, {
    optional: true
  });
  protected readonly icons = addIcons({ elementDown2 });

  private readonly header = inject(SiApplicationHeaderComponent);

  ngOnInit(): void {
    if (this.dropdownTrigger) {
      this.header.closeMobileMenus.subscribe(() => this.dropdownTrigger!.close());
    }
  }

  protected click(): void {
    if (!this.dropdownTrigger?.isOpen && !this.collapsibleActions?.mobileExpanded()) {
      // we must close other immediately as we would close the dropdown else wise immediately after opening.
      this.header.closeMobileMenus.next();
    } else if (!this.dropdownTrigger || !this.collapsibleActions?.mobileExpanded()) {
      // we must use queueMicrotask, otherwise the dropdown gets re-opened immediately.
      queueMicrotask(() => this.header.closeMobileMenus.next());
    }
  }
}
