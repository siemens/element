/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiTabNextBaseDirective } from './si-tab-next-base.directive';

/** @experimental */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-tab-next][routerLink]',
  imports: [NgClass, SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-tab-next.component.html',
  styleUrl: './si-tab-next.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.active]': 'routerLinkActive.isActive',
    '[attr.aria-selected]': 'routerLinkActive.isActive'
  },
  hostDirectives: [
    {
      directive: RouterLinkActive
    }
  ]
})
export class SiTabNextLinkComponent extends SiTabNextBaseDirective {
  private router = inject(Router, { optional: true });
  /** @defaultValue false */
  override readonly active = signal(false);
  /** @internal */
  routerLink = inject(RouterLink, { optional: true, self: true });
  protected routerLinkActive = inject(RouterLinkActive, { self: true });
  constructor() {
    super();
    this.routerLinkActive.isActiveChange
      .pipe(takeUntilDestroyed())
      .subscribe(isActive => this.active.set(isActive));

    effect(() => {
      if (this.active()) {
        if (this.router && this.routerLink?.urlTree) {
          this.router.navigateByUrl(this.routerLink.urlTree);
        }
      }
    });
  }
}
