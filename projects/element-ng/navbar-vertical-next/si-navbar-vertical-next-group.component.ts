/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-group',
  imports: [CdkTrapFocus],
  template: `@if (visible()) {
    <div
      animate.leave="group-leave"
      [class.inline-group]="!flyout"
      [class.dropdown-menu]="flyout"
      [cdkTrapFocus]="flyout"
      [cdkTrapFocusAutoCapture]="autoCaptureFocus()"
    >
      <div [class.overflow-hidden]="!flyout">
        <ng-content />
      </div>
    </div>
  }`,
  styleUrl: './si-navbar-vertical-next-group.component.scss',
  host: {
    role: 'group',
    '[id]': 'groupTrigger.groupId',
    '[attr.aria-labelledby]': 'groupTrigger.id',
    'animate.enter': 'component-enter',
    '(keydown.escape)': 'close()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()'
  }
})
export class SiNavbarVerticalNextGroupComponent {
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  protected readonly groupTrigger = inject(SiNavbarVerticalNextGroupTriggerDirective);
  private readonly routerLinkActive = inject(RouterLinkActive, { optional: true });

  // Store initial value, as the mode for an instance never changes.
  protected flyout = this.groupTrigger.flyout();

  protected readonly autoCaptureFocus = computed(
    () => this.flyout && !this.navbar.alwaysOpenGroupsInFlyout()
  );

  protected readonly visible = computed(() => {
    return this.flyout || (!this.navbar.collapsed() && this.groupTrigger.expanded());
  });

  constructor() {
    this.routerLinkActive?.isActiveChange
      .pipe(takeUntilDestroyed())
      .subscribe(active => this.groupTrigger.active.set(active));
  }

  protected close(): void {
    this.groupTrigger.hideFlyout();
  }

  protected onMouseEnter(): void {
    if (this.flyout && this.navbar.alwaysOpenGroupsInFlyout()) {
      this.groupTrigger.cancelHoverClose();
    }
  }

  protected onMouseLeave(): void {
    if (this.flyout && this.navbar.alwaysOpenGroupsInFlyout()) {
      this.groupTrigger.scheduleHoverClose();
    }
  }
}
