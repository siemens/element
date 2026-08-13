/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, computed, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';
import { elementDown2, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { EMPTY, Observable } from 'rxjs';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-navbar-vertical-next-item], button[si-navbar-vertical-next-item]',
  imports: [SiIconComponent],
  templateUrl: './si-navbar-vertical-next-item.component.html',
  styleUrl: './si-navbar-vertical-next-item.component.scss',
  host: {
    class: 'navbar-vertical-item focus-inside',
    '[class.active]': 'showActive()',
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

  /**
   * Text label of this item.
   * Consumed by the chip button to mirror the active item's label when collapsed.
   */
  readonly label = input<string | undefined>();

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

  /** Signal mirror of `RouterLinkActive.isActive`.
   * @internal
   */
  private readonly routerActive = toSignal(
    this.routerLinkActive?.isActiveChange ?? (EMPTY as Observable<boolean>),
    { initialValue: this.routerLinkActive?.isActive ?? false }
  );

  /** `true` when the navbar is in chip mode (inline-collapse active and collapsed).
   * @internal
   */
  readonly chipMode = this.navbar.chipMode;

  /**
   * Determines if the badge contains text-only content (not numeric)
   */
  protected readonly textOnlyBadge = computed(() => {
    const badge = this.badge();
    return badge != null && badge !== '' ? typeof badge !== 'number' : false;
  });

  /** `true` when the `active` CSS class should be applied to this item.
   *
   * In chip mode the root-level items are hidden inside the collapsed nav until
   * the user opens the chip menu, so their active state is suppressed to avoid
   * flashing when the menu closes. Sub-items and open group triggers always
   * reflect activity. While the chip menu is open, root-level active items must
   * be highlighted so the user can locate the current page in the overlay.
   * @internal
   */
  protected readonly showActive = computed(() => {
    if (this.chipMode()) {
      if (this.navbar.chipMenuOpen()) {
        return this.active();
      }
      return (!!this.parent || this.group?.flyout()) && this.active();
    }
    return this.active();
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

  /** Active via override or router link — excludes group state.
   * @internal
   */
  private readonly anyRouteActive = computed(() => !!this.activeOverride() || this.routerActive());

  /** Own route is active, or a descendant route is active — includes group state, not gated on expansion.
   * @internal
   */
  private readonly isOnActiveRoute = computed(
    () => this.anyRouteActive() || !!this.group?.active()
  );

  /**
   * `true` when this item should reflect activity.
   *
   * For non-trigger items: equivalent to being on the active route.
   *
   * For group trigger items: also `true` when a descendant route is active and
   * the descendant is not currently visible inline — i.e. the group is collapsed
   * or the navbar is collapsed. This surfaces the active state on the trigger
   * when the active child cannot show it itself.
   */
  readonly active = computed(
    () =>
      this.anyRouteActive() ||
      ((!this.group?.expanded() || this.navbar.collapsed()) && !!this.group?.active())
  );

  /** `true` when this is a root-level item on the active route (ungated, so the chip survives collapse↔expand).
   * @internal
   */
  readonly isActiveRootItem = computed(() => !this.parent && this.isOnActiveRoute());

  ngOnInit(): void {
    if (this.group && this.active()) {
      this.group.expanded.set(true);
    }
  }

  protected triggered(): void {
    this.parent?.group?.hideFlyout();
    if (!this.group) {
      this.navbar.itemTriggered();
    }
  }
}
