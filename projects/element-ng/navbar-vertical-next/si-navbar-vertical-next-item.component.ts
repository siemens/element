/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit
} from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { elementDown2, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

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
    '[class.dropdown-item]': '!openGroupsInFlyout() && this.parent?.group?.flyout()',
    '[class.navbar-vertical-item]': '!this.parent?.group?.flyout() || openGroupsInFlyout()',
    '[class.active]': 'active',
    '[class.hide-badge-collapsed]': 'hideBadgeWhenCollapsed()',
    '(click)': 'triggered()'
  }
})
export class SiNavbarVerticalNextItemComponent implements OnInit {
  protected readonly icons = addIcons({ elementDown2, elementRight2 });

  /** Optional icon to render before the label. */
  readonly icon = input<string>();

  /** Badge value to display. */
  readonly badge = input<string | number>();

  /** Color of the badge. */
  readonly badgeColor = input<string>();

  /**
   * Hide the badge when the navbar is collapsed.
   *
   * @defaultValue false
   */
  readonly hideBadgeWhenCollapsed = input(false, { transform: booleanAttribute });

  /** Override the active state. Useful for action items. */
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
   * Determines if the badge contains text-only content (not numeric)
   */
  protected readonly textOnlyBadge = computed(() => {
    const badge = this.badge();
    return badge != null && badge !== '' ? typeof badge !== 'number' : false;
  });

  /**
   * Formats badge value to limit display to "+99" for numbers greater than 99
   */
  protected readonly formattedBadge = computed(() => {
    const badge = this.badge();
    if (badge == null || badge === '') {
      return '';
    }
    if (typeof badge === 'number') {
      return badge > 99 ? '+99' : badge.toString();
    }
    return badge.toString();
  });

  protected readonly openGroupsInFlyout = computed(() => this.navbar?.alwaysOpenGroupsInFlyout());

  ngOnInit(): void {
    if (this.group && this.active) {
      this.group.expanded.set(true);
    }
  }

  protected triggered(): void {
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
  }
}
