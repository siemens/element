/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkPortal, DomPortal, PortalModule } from '@angular/cdk/portal';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';
import { elementDown2, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { EMPTY, Observable } from 'rxjs';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-navbar-vertical-next-item], button[si-navbar-vertical-next-item]',
  imports: [PortalModule, SiIconComponent],
  templateUrl: './si-navbar-vertical-next-item.component.html',
  styleUrl: './si-navbar-vertical-next-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'focus-inside navbar-vertical-item',
    '[class.active]': 'active()',
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
   * Reactive mirror of `RouterLinkActive.isActive`. Bridges the non-signal
   * `RouterLinkActive` API into the signal world via `isActiveChange`.
   */
  private readonly routerActive = toSignal(
    this.routerLinkActive?.isActiveChange ?? (EMPTY as Observable<boolean>),
    { initialValue: this.routerLinkActive?.isActive ?? false }
  );

  private readonly labelContentEl = viewChild.required<ElementRef<HTMLElement>>('labelContent');

  /**
   * DOM portal of this item's label element. Used internally by the chip
   * template to relocate the label into the inline-collapse chip button.
   * @internal
   */
  protected readonly labelPortalRef = computed(() => new DomPortal(this.labelContentEl()));

  /**
   * Template portal of this item's inline-collapse chip view. The navbar
   * attaches it to a `CdkPortalOutlet` in the inline-collapse bar. The
   * template renders a `<button>` that invokes `triggered()` on click and
   * embeds the item's icon and label, so all interactive behavior remains
   * owned by the item.
   * @internal
   */
  readonly portalContent = viewChild.required(CdkPortal);

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

  /**
   * `true` when this item — or one of its descendants — is on the
   * currently-active route. Ungated counterpart of `active()`: shares the
   * same source signals but omits the
   * `(!group.expanded() || navbar.collapsed())` suppression so the
   * inline-collapse chip wrapper stays mounted across collapse↔expand
   * transitions and the slide animation can run.
   */
  private readonly isOnActiveRoute = computed(
    () =>
      !!this.activeOverride() ||
      this.routerActive() ||
      !!this.siLink?.active() ||
      !!this.group?.active()
  );

  /**
   * `true` when this item is currently active (via router link, link
   * directive, override, or active group state).
   */
  readonly active = computed(
    () =>
      this.activeOverride() ||
      this.routerActive() ||
      (this.siLink?.active() ?? false) ||
      ((!this.group?.expanded() || this.navbar.collapsed()) && (this.group?.active() ?? false))
  );

  /**
   * `true` when this item is a top-level (root) item and is currently active.
   * Used by the navbar to surface the active item in the inline-collapse bar.
   * Uses the ungated `isOnActiveRoute` so the chip wrapper survives the
   * collapse↔expand transition (the gate in `active()` would otherwise drop
   * to `false` mid-animation and tear down the wrapper).
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
