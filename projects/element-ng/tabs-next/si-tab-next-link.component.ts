/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { startWith } from 'rxjs/operators';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabNextBaseDirective } from './si-tab-next-base.directive';

/** @experimental */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-tab-next][routerLink]',
  imports: [SiIconNextComponent, SiTranslatePipe, SiTabBadgeComponent],
  templateUrl: './si-tab-next.component.html',
  styleUrl: './si-tab-next.component.scss',
  providers: [{ provide: SiTabNextBaseDirective, useExisting: SiTabNextLinkComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: RouterLinkActive
    }
  ]
})
export class SiTabNextLinkComponent extends SiTabNextBaseDirective {
  private router = inject(Router);
  /** @internal */
  routerLink = inject(RouterLink, { self: true });
  protected routerLinkActive = inject(RouterLinkActive, { self: true });
  /** @defaultValue false */
  override readonly active = toSignal(
    this.routerLinkActive.isActiveChange.pipe(startWith(this.routerLinkActive.isActive))
  );

  override selectTab(retainFocus?: boolean): void {
    if (this.routerLink.urlTree) {
      this.router.navigateByUrl(this.routerLink.urlTree, {
        skipLocationChange: this.routerLink.skipLocationChange,
        replaceUrl: this.routerLink.replaceUrl,
        info: this.routerLink.info,
        state: this.routerLink.state
      });
    }
    super.selectTab(retainFocus);
  }
}
