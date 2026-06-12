/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DomPortal } from '@angular/cdk/portal';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.focus-inside]': '!chipMode() || !!parent',
    '[class.navbar-vertical-item]': '!isChip()',
    '[class.active]': 'showActive()',
    '[class.is-chip]': 'isChip()',
    '[class.btn]': 'isChip()',
    '[class.btn-primary-ghost]': 'isChip()',
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

  /** Signal mirror of `RouterLinkActive.isActive`.
   * @internal
   */
  private readonly routerActive = toSignal(
    this.routerLinkActive?.isActiveChange ?? (EMPTY as Observable<boolean>),
    { initialValue: this.routerLinkActive?.isActive ?? false }
  );

  /** @internal */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** DOM portal relocated into the chip slot when collapsed.
   * @internal
   */
  readonly hostPortal = new DomPortal(this.elementRef.nativeElement);

  /** Signal mirror of the navbar's chip mode. `true` when inline-collapse is active and the navbar is collapsed.
   * @internal
   */
  readonly chipMode = computed(() => this.navbar.chipMode());

  /**
   * Determines if the badge contains text-only content (not numeric)
   */
  protected readonly textOnlyBadge = computed(() => {
    const badge = this.badge();
    return badge != null && badge !== '' ? typeof badge !== 'number' : false;
  });

  /** `true` when the `active` CSS class should be applied to this item.
   *
   * In chip mode, root-level items use `is-chip` styling instead of `active`, so the
   * class is suppressed unless the item is a sub-item (`parent` is set) or it is a
   * group trigger whose flyout is currently open.
   * Outside chip mode the value equals `active()`.
   * @internal
   */
  protected readonly showActive = computed(() => {
    if (this.chipMode()) {
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

  /** `true` when this item is currently rendered as a chip in the inline-collapse bar.
   * @internal
   */
  readonly isChip = computed(() => this.navbar.chipPortalAttached() && this.isActiveRootItem());

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
