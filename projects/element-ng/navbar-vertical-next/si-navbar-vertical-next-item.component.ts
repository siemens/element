/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnInit
} from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { elementDown2 } from '@siemens/element-icons';
import { MenuItem } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import {
  NavbarVerticalNextItemAction,
  NavbarVerticalNextItemGroup,
  NavbarVerticalNextItemLink,
  NavbarVerticalNextItemRouterLink
} from './si-navbar-vertical-next.model';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

type NavbarVerticalNextItemInteractive =
  | NavbarVerticalNextItemGroup
  | NavbarVerticalNextItemRouterLink
  | NavbarVerticalNextItemLink
  | NavbarVerticalNextItemAction;

/** @experimental */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-navbar-vertical-next-item], button[si-navbar-vertical-next-item]',
  imports: [SiIconComponent],
  templateUrl: './si-navbar-vertical-next-item.component.html',
  styleUrl: './si-navbar-vertical-next-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'focus-inside',
    '[class.dropdown-item]': 'this.parent?.group?.flyout()',
    '[class.navbar-vertical-item]': '!this.parent?.group?.flyout()',
    '[class.active]': 'active',
    '[class.hide-badge-collapsed]': 'hideBadgeCollapsed()'
  }
})
export class SiNavbarVerticalNextItemComponent implements OnInit {
  protected readonly icons = addIcons({ elementDown2 });
  readonly item = input.required<NavbarVerticalNextItemInteractive | MenuItem>({
    alias: 'si-navbar-vertical-next-item'
  });
  readonly activeOverride = input<boolean>();

  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  protected readonly parent = inject(SiNavbarVerticalNextItemComponent, {
    skipSelf: true,
    optional: true
  });
  readonly group = inject(SiNavbarVerticalNextGroupTriggerDirective, {
    optional: true,
    self: true
  });
  private readonly routerLinkActive = inject(RouterLinkActive, { optional: true });
  private readonly siLink = inject(SiLinkDirective, { optional: true });

  /**
   * Hides the badge in collapsed state
   */
  protected readonly hideBadgeCollapsed = computed(
    () => !!(this.item() as NavbarVerticalNextItemInteractive).hideBadgeWhenCollapsed
  );

  /**
   * Determines if the badge contains text-only content (not numeric)
   */
  protected readonly textOnlyBadge = computed(() => {
    const badge = this.item().badge;
    return badge ? typeof badge !== 'number' : false;
  });

  /**
   * Formats badge value to limit display to "+99" for numbers greater than 99
   */
  protected readonly formattedBadge = computed(() => {
    const badge = this.item().badge;
    if (!badge) {
      return '';
    }
    if (typeof badge === 'number') {
      return badge > 99 ? '+99' : badge.toString();
    }
    return badge.toString();
  });

  ngOnInit(): void {
    if (this.group && this.active) {
      this.group.expanded.set(true);
    }
  }

  @HostListener('click') protected triggered(): void {
    const item = this.item();
    if (item.type === 'action') {
      item.action(item);
      return;
    }
    this.parent?.group?.hideFlyout();
    if (!this.group) {
      this.navbar.itemTriggered();
    }
  }

  get active(): boolean {
    return (
      this.activeOverride() ||
      this.routerLinkActive?.isActive ||
      this.siLink?.active() ||
      ((!this.group?.expanded() || this.navbar.collapsed()) && this.group?.active()) ||
      false
    );
    /* eslint-disable-enable @typescript-eslint/prefer-nullish-coalescing */
  }
}
