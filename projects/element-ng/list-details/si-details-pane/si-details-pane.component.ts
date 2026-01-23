/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { SiListDetailsComponent } from '../si-list-details.component';

@Component({
  selector: 'si-details-pane',
  imports: [],
  templateUrl: './si-details-pane.component.html',
  styleUrl: './si-details-pane.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.expanded]': 'parent.hasLargeSize()',
    '[class.details-active]': 'parent.detailsActive() && !parent.hasLargeSize()',
    '[attr.inert]': '!parent.hasLargeSize() && !parent.detailsActive() ? "" : null',
    '[style.flex-basis.%]':
      'parent.hasLargeSize() && parent.disableResizing() ?  100 - parent.listWidth() : undefined'
  }
})
export class SiDetailsPaneComponent {
  protected parent = inject(SiListDetailsComponent);

  private readonly routerOutlet = contentChild(RouterOutlet);
  private subscription?: Subscription;
  private destroyer = inject(DestroyRef);
  /** @internal */
  readonly isRouterBased = computed(() => !!this.routerOutlet());

  constructor() {
    effect(() => {
      const outlet = this.routerOutlet();
      if (outlet) {
        this.parent.detailsActive.set(!outlet.activatedRouteData.SI_EMPTY_DETAILS);
        this.subscription?.unsubscribe();
        this.subscription = outlet.activateEvents
          .pipe(takeUntilDestroyed(this.destroyer))
          .subscribe(() =>
            this.parent.detailsActive.set(!outlet.activatedRouteData.SI_EMPTY_DETAILS)
          );
      }
    });
  }
}
