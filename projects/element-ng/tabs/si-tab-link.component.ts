/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { startWith } from 'rxjs/operators';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabBaseDirective } from './si-tab-base.directive';

/**
 * Creates a tab that uses the Angular router.
 *
 * @example
 * ```html
 * <si-tabset>
 *   <a si-tab routerLink="/home" heading="Home"></a>
 *
 *   <router-outlet />
 * </si-tabset>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-tab][routerLink]',
  imports: [SiIconComponent, SiTranslatePipe, SiTabBadgeComponent],
  templateUrl: './si-tab.component.html',
  styleUrl: './si-tab.component.scss',
  providers: [{ provide: SiTabBaseDirective, useExisting: SiTabLinkComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [RouterLinkActive, SiTooltipDirective]
})
export class SiTabLinkComponent extends SiTabBaseDirective {
  private tooltipDirective = inject(SiTooltipDirective);
  private router = inject(Router);
  /** @internal */
  routerLink = inject(RouterLink, { self: true });
  protected routerLinkActive = inject(RouterLinkActive, { self: true });
  /** @defaultValue false */
  override readonly active = toSignal(
    this.routerLinkActive.isActiveChange.pipe(startWith(this.routerLinkActive.isActive))
  );
  /** {@inheritDoc} */
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

  constructor() {
    super();
    effect(() => this.tooltipDirective.setTooltipContent(this.icon() ? this.heading() : ''));
  }
}
