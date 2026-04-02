/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';

import { SiNavbarVerticalNextDividerComponent } from './si-navbar-vertical-next-divider.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next-header',
  imports: [SiNavbarVerticalNextDividerComponent],
  template: `
    @if (!navbar.collapsed()) {
      <div class="title si-h5 text-secondary text-truncate p-5" animate.leave="title-leave">
        <ng-content />
      </div>
    } @else {
      <si-navbar-vertical-next-divider class="divider" animate.leave="divider-leave" />
    }
  `,
  styleUrl: './si-navbar-vertical-next-header.component.scss',
  host: {
    '[class.collapsed]': 'navbar.collapsed()',
    'animate.enter': 'component-enter'
  }
})
export class SiNavbarVerticalNextHeaderComponent {
  protected navbar = inject(SI_NAVBAR_VERTICAL_NEXT);
}
