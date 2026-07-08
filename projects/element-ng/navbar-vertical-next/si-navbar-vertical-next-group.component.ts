/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-group',
  imports: [CdkTrapFocus],
  template: `@if (visible()) {
    @let flyout = groupTrigger.flyout();
    @let flat = navbar.flatMode();

    <div
      animate.leave="group-leave"
      [class.inline-group]="!flyout && !flat"
      [class.dropdown-menu]="flyout"
      [class.flat-group]="flat"
      [cdkTrapFocus]="flyout"
      [cdkTrapFocusAutoCapture]="flyout"
    >
      <div [class.overflow-hidden]="!flyout">
        <ng-content />
      </div>
    </div>
  }`,
  styleUrl: './si-navbar-vertical-next-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'group',
    '[id]': 'groupTrigger.groupId',
    '[attr.aria-labelledby]': 'groupTrigger.flatGroupActive() ? groupTrigger.groupId + "-heading" : groupTrigger.id',
    'animate.enter': 'component-enter',
    '[class.flat-group-active]': 'groupTrigger.flatGroupActive()',
    '(keydown.escape)': 'close()'
  }
})
export class SiNavbarVerticalNextGroupComponent {
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  protected readonly groupTrigger = inject(SiNavbarVerticalNextGroupTriggerDirective);
  private readonly routerLinkActive = inject(RouterLinkActive, { optional: true });

  /** Projected items, used to move focus into the first item when the flat group opens. */
  private readonly items = contentChildren(SiNavbarVerticalNextItemComponent, {
    descendants: true
  });

  protected readonly visible = computed(() => {
    return (
      this.groupTrigger.flyout() ||
      this.groupTrigger.flatGroupActive() ||
      (!this.navbar.collapsed() && !this.navbar.flatMode() && this.groupTrigger.expanded())
    );
  });

  constructor() {
    this.routerLinkActive?.isActiveChange
      .pipe(takeUntilDestroyed())
      .subscribe(active => this.groupTrigger.active.set(active));

    // Flat group mode does not trap focus (the user must still be able to
    // tab to the back button and the drawer toggle). Instead, move focus to
    // the first item when it opens and back to the trigger when it closes.
    let wasActive = false;
    effect(() => {
      const active = this.groupTrigger.flatGroupActive();
      if (active && !wasActive) {
        this.items().at(0)?.focus();
      } else if (!active && wasActive) {
        this.groupTrigger.focus();
      }
      wasActive = active;
    });
  }

  protected close(): void {
    if (this.groupTrigger.flatGroupActive()) {
      this.navbar.flatGroup()?.closeFlatGroup();
      return;
    }
    this.groupTrigger.hideFlyout();
  }
}
