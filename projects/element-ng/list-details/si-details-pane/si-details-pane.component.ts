/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiListDetailsComponent } from '../si-list-details.component';

/** @experimental */
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
    '[style.max-inline-size]': 'parent.maxDetailsSize()'
  }
})
export class SiDetailsPaneComponent {
  protected parent = inject(SiListDetailsComponent);

  private readonly routerOutlet = contentChild(RouterOutlet);
  /** @internal */
  readonly isRouterBased = computed(() => !!this.routerOutlet());

  constructor() {
    effect(() => {
      const outlet = this.routerOutlet();
      if (outlet) {
        outlet.activateEvents.subscribe(() =>
          this.parent.detailsActive.set(!outlet.activatedRouteData.SI_EMPTY_DETAILS)
        );
      }
    });
  }
}
