/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, HostListener, inject, OnInit } from '@angular/core';
import { SiHeaderDropdownTriggerDirective } from '@spike-rabbit/element-ng/header-dropdown';
import { addIcons, elementDown2 } from '@spike-rabbit/element-ng/icon';

import { SiApplicationHeaderComponent } from './si-application-header.component';
import { SiHeaderCollapsibleActionsComponent } from './si-header-collapsible-actions.component';

@Directive({})
export abstract class SiHeaderActionItemBase implements OnInit {
  /** @internal */
  dropdownTrigger = inject(SiHeaderDropdownTriggerDirective, {
    self: true,
    optional: true
  });
  protected collapsibleActions = inject(SiHeaderCollapsibleActionsComponent, { optional: true });
  protected readonly icons = addIcons({ elementDown2 });

  private header = inject(SiApplicationHeaderComponent);

  ngOnInit(): void {
    if (this.dropdownTrigger) {
      this.header.closeMobileMenus.subscribe(() => this.dropdownTrigger!.close());
    }
  }

  @HostListener('click')
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
