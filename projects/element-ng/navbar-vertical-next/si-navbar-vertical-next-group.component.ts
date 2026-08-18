/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { afterRenderEffect, Component, computed, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';
import { elementLeft2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiNavbarVerticalNextGroupTriggerDirective } from './si-navbar-vertical-next-group-trigger.directive';
import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-group',
  imports: [CdkTrapFocus, SiIconComponent, SiTranslatePipe],
  template: `@if (visible()) {
    @let flyout = groupTrigger.flyout();
    @let flat = navbar.flatMode();
    <div
      animate.leave="group-leave"
      [class.inline-group]="!flyout && !flat"
      [class.dropdown-menu]="flyout"
      [class.flat-group]="flat"
    >
      @if (groupTrigger.flatGroupActive()) {
        <div class="flat-group-header">
          <button
            type="button"
            class="btn btn-icon btn-tertiary-ghost"
            [attr.aria-label]="ariaLabel() | translate"
            (click)="navbar.closeFlatGroup()"
          >
            <si-icon class="flip-rtl" [icon]="icons.elementLeft2" />
          </button>
          <span class="item-title text-truncate si-h5" [id]="flatGroupTitleId">
            {{ triggerItem.label() | translate }}
          </span>
        </div>
      }
      <div
        [class.overflow-hidden]="!flyout"
        [cdkTrapFocus]="flyout"
        [cdkTrapFocusAutoCapture]="flyout"
      >
        <ng-content />
      </div>
    </div>
  }`,
  styleUrl: './si-navbar-vertical-next-group.component.scss',
  host: {
    '[attr.role]': "groupTrigger.flyout() ? 'dialog' : 'group'",
    '[id]': 'groupTrigger.groupId',
    '[attr.aria-labelledby]': 'groupTrigger.flatGroupActive() ? flatGroupTitleId : groupTrigger.id',
    'animate.enter': 'component-enter',
    '[class.flat-group-active]': 'groupTrigger.flatGroupActive()',
    '(keydown.escape)': 'close()'
  }
})
export class SiNavbarVerticalNextGroupComponent {
  protected readonly icons = addIcons({ elementLeft2 });
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
  protected readonly groupTrigger = inject(SiNavbarVerticalNextGroupTriggerDirective);
  protected readonly triggerItem = inject(SiNavbarVerticalNextItemComponent);
  protected readonly flatGroupTitleId = `${this.groupTrigger.groupId}-title`;

  /**
   * Back button text for flat groups.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.BACK:Back`)
   * ```
   */
  readonly ariaLabel = input(t(() => $localize`:@@SI_NAVBAR_VERTICAL.BACK:Back`));

  private readonly routerLinkActive = inject(RouterLinkActive, { optional: true });
  private readonly focusTrap = viewChild.required(CdkTrapFocus);
  private wasFlatGroupActive = false;

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

    afterRenderEffect(() => this.updateFlatGroupFocus());
  }

  protected close(): void {
    if (this.groupTrigger.flatGroupActive()) {
      this.navbar.closeFlatGroup();
      return;
    }
    this.groupTrigger.hideFlyout();
  }

  private updateFlatGroupFocus(): void {
    const isFlatGroupActive = this.groupTrigger.flatGroupActive();
    if (isFlatGroupActive === this.wasFlatGroupActive) {
      return;
    }

    this.wasFlatGroupActive = isFlatGroupActive;
    if (isFlatGroupActive) {
      this.focusTrap().focusTrap.focusFirstTabbableElementWhenReady();
    } else {
      this.groupTrigger.focus();
    }
  }
}
