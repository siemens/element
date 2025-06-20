/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, computed, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';

import { SiNavbarVerticalGroupTriggerDirective } from './si-navbar-vertical-group-trigger.directive';
import { SiNavbarVerticalItemComponent } from './si-navbar-vertical-item.component';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

// We have to use a component to build animations.
@Component({
  selector: 'si-navbar-vertical-group',
  template: `<div [cdkTrapFocus]="flyout" [cdkTrapFocusAutoCapture]="flyout">
    <ng-content />
  </div>`,
  styles: `
    :host {
      display: block;
      overflow: hidden;
    }
  `,
  host: {
    role: 'group',
    '[id]': 'groupTrigger.groupId',
    '[attr.aria-labelledby]': 'groupTrigger.id',
    '[class.dropdown-menu]': 'flyout',
    '[@collapse]': 'state() ?? "collapsed"'
  },
  imports: [CdkTrapFocus],
  animations: [
    trigger('collapse', [
      state('collapsed', style({ display: 'none' })),
      // Prevents initial animation. See: https://stackoverflow.com/a/50791299
      transition(':enter', []),
      transition('collapsed => expanded', [
        style({ 'display': 'block', 'block-size': '0' }),
        animate('0.5s ease', style({ 'block-size': '*' }))
      ]),
      transition('expanded => collapsed', [animate('0.5s ease', style({ 'block-size': '0' }))])
    ])
  ]
})
export class SiNavbarVerticalGroupComponent {
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL);
  protected readonly groupTrigger = inject(SiNavbarVerticalGroupTriggerDirective);
  readonly groupParent = inject(SiNavbarVerticalItemComponent);
  private readonly routerLinkActive = inject(RouterLinkActive, { optional: true });

  // Store initial value, as the mode for an instance never changes.
  protected flyout = this.groupTrigger.flyout();

  protected readonly visible = computed(() => {
    return this.flyout || (!this.navbar.collapsed() && this.groupTrigger.expanded());
  });

  protected readonly state = computed(() => {
    if (this.flyout) {
      return 'flyout';
    }

    if (this.groupTrigger.expanded() && !this.navbar.collapsed()) {
      return 'expanded';
    }

    return 'collapsed';
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
