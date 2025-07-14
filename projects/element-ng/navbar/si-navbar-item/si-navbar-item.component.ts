/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  DoCheck,
  inject,
  input,
  OnDestroy,
  OnInit,
  viewChild
} from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemsFactoryComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiNavbarPrimaryComponent } from '../si-navbar-primary/si-navbar-primary.component';

/** @deprecated Use the new `si-application-header` instead. */
@Component({
  selector: 'si-navbar-item',
  imports: [
    SiLinkDirective,
    SiTranslateModule,
    NgClass,
    NgTemplateOutlet,
    SiHeaderDropdownComponent,
    SiHeaderDropdownItemsFactoryComponent,
    SiHeaderDropdownTriggerDirective
  ],
  templateUrl: './si-navbar-item.component.html',
  host: { class: 'd-contents' }
})
export class SiNavbarItemComponent implements OnInit, DoCheck, OnDestroy {
  /**
   * MenuItem to display in the navbar.
   */
  readonly item = input.required<MenuItem>();

  /**
   * Is the item a quick action displayed on the end (right in LTR) side
   *
   * @defaultValue false
   */
  readonly quickAction = input(false, { transform: booleanAttribute });

  readonly dropdownTrigger = viewChild(SiHeaderDropdownTriggerDirective);

  protected active = false;
  protected navbar = inject(SiNavbarPrimaryComponent);

  private hasBadge = false;

  ngOnInit(): void {
    this.navbar.header().closeMobileMenus.subscribe(() => this.dropdownTrigger()?.close());
    this.navbar.navItemCount.update(value => value + 1);
  }

  ngDoCheck(): void {
    const item = this.item();
    const newHasBadge = !!(item.badge ?? item.badgeDot);
    if (this.quickAction() && this.hasBadge !== newHasBadge) {
      this.hasBadge = newHasBadge;
      if (this.hasBadge) {
        this.navbar.collapsibleActions()?.badgeCount.update(value => value + 1);
      } else {
        this.navbar.collapsibleActions()?.badgeCount.update(value => value - 1);
      }
    }
  }

  ngOnDestroy(): void {
    this.navbar.navItemCount.update(value => value - 1);
  }

  protected click(): void {
    if (!this.dropdownTrigger()) {
      this.navbar.header().closeMobileMenus.next();
    }
  }

  protected get visuallyHideTitle(): boolean {
    return !this.navbar.collapsibleActions()?.mobileExpanded();
  }
}
