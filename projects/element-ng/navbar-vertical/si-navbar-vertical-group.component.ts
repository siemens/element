/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, computed, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';

import { SiNavbarVerticalGroupTriggerDirective } from './si-navbar-vertical-group-trigger.directive';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  selector: 'si-navbar-vertical-group',
  imports: [CdkTrapFocus],
  template: `@if (visible()) {
    <div
      animate.leave="group-leave"
      [class.inline-group]="!flyout"
      [class.dropdown-menu]="flyout"
      [cdkTrapFocus]="flyout"
      [cdkTrapFocusAutoCapture]="flyout"
    >
      <div [class.overflow-hidden]="!flyout">
        <ng-content />
      </div>
    </div>
  }`,
  styleUrl: './si-navbar-vertical-group.component.scss',
  host: {
    role: 'group',
    '[id]': 'groupTrigger.groupId',
    '[attr.aria-labelledby]': 'groupTrigger.id',
    'animate.enter': 'component-enter'
  }
})
export class SiNavbarVerticalGroupComponent {
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL);
  protected readonly groupTrigger = inject(SiNavbarVerticalGroupTriggerDirective);
  private readonly routerLinkActive = inject(RouterLinkActive, { optional: true });

  // Store initial value, as the mode for an instance never changes.
  protected flyout = this.groupTrigger.flyout();

  protected readonly visible = computed(() => {
    return this.flyout || (!this.navbar.collapsed() && this.groupTrigger.expanded());
  });

  constructor() {
    this.routerLinkActive?.isActiveChange
      .pipe(takeUntilDestroyed())
      .subscribe(active => this.groupTrigger.active.set(active));
  }

  @HostListener('keydown.escape') protected close(): void {
    this.groupTrigger.hideFlyout();
  }
}
