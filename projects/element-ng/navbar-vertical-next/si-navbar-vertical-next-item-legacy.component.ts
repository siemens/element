/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input, model, viewChildren } from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SiNavbarVerticalNextGroupComponent } from './si-navbar-vertical-next-group.component';
import { SiNavbarVerticalNextHeaderComponent } from './si-navbar-vertical-next-header.component';
import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-item-legacy',
  imports: [
    SiLinkDirective,
    SiTranslatePipe,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextHeaderComponent
  ],
  templateUrl: './si-navbar-vertical-next-item-legacy.component.html',
  styleUrl: './si-navbar-vertical-next-item-legacy.component.scss',
  host: {
    'class': 'd-block mb-4'
  }
})
export class SiNavbarVerticalNextItemLegacyComponent {
  readonly item = input.required<MenuItem>();
  readonly navbarExpandButtonText = input.required();
  readonly navbarCollapseButtonText = input.required();
  readonly expanded = model.required<boolean>();

  protected readonly flyoutItems = computed(() => {
    if (!this.navbar.collapsed()) {
      return this.item().items;
    } else {
      return [
        this.isLink() ? { ...this.item(), items: undefined } : [],
        this.item().items ?? []
      ].flat();
    }
  });

  protected readonly isLink = computed(() => {
    const item = this.item();
    return !!item.action || !!item.link || !!item.href;
  });

  protected readonly toggleButtonLabel = computed(() =>
    this.navbar.collapsed()
      ? this.navbarExpandButtonText()
      : this.expanded()
        ? this.navbarCollapseButtonText()
        : this.navbarExpandButtonText()
  );

  protected readonly siLinks = viewChildren(SiLinkDirective);
  protected readonly itemActive = computed(
    () =>
      (this.navbar.collapsed() || !this.expanded()) && this.siLinks().some(link => link.active())
  );
  protected navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
}
