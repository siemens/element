/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';

import { SiNavbarVerticalDividerComponent } from './si-navbar-vertical-divider.component';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  selector: 'si-navbar-vertical-header',
  imports: [SiNavbarVerticalDividerComponent],
  template: `
    @if (!navbar.collapsed()) {
      <div class="title si-h5 text-secondary text-truncate p-5" animate.leave="title-leave">
        <ng-content />
      </div>
    } @else {
      <si-navbar-vertical-divider class="divider" animate.leave="divider-leave" />
    }
  `,
  styleUrl: './si-navbar-vertical-header.component.scss',
  host: {
    '[class.collapsed]': 'navbar.collapsed()',
    'animate.enter': 'component-enter'
  }
})
export class SiNavbarVerticalHeaderComponent {
  protected navbar = inject(SI_NAVBAR_VERTICAL);
}
