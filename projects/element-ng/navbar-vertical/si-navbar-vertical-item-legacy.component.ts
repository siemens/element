/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  viewChildren
} from '@angular/core';
import { MenuItem } from '@siemens/element-ng/common';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiNavbarVerticalGroupTriggerDirective } from './si-navbar-vertical-group-trigger.directive';
import { SiNavbarVerticalGroupComponent } from './si-navbar-vertical-group.component';
import { SiNavbarVerticalHeaderComponent } from './si-navbar-vertical-header.component';
import { SiNavbarVerticalItemComponent } from './si-navbar-vertical-item.component';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  selector: 'si-navbar-vertical-item-legacy',
  imports: [
    SiLinkDirective,
    SiTranslatePipe,
    SiNavbarVerticalItemComponent,
    SiNavbarVerticalGroupTriggerDirective,
    SiNavbarVerticalGroupComponent,
    SiNavbarVerticalHeaderComponent
  ],
  templateUrl: './si-navbar-vertical-item-legacy.component.html',
  styleUrl: './si-navbar-vertical-item-legacy.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'd-block mb-4'
  }
})
export class SiNavbarVerticalItemLegacyComponent {
  /** Legacy menu item to render in the vertical navbar. */
  readonly item = input.required<MenuItem>();
  /** Accessible label for expanding the item group. */
  readonly navbarExpandButtonText = input.required();
  /** Accessible label for collapsing the item group. */
  readonly navbarCollapseButtonText = input.required();
  /** Whether the item group is expanded. Emits `expandedChange` when changed. */
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
  protected navbar = inject(SI_NAVBAR_VERTICAL);
}
