/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { afterNextRender, Component, inject, signal } from '@angular/core';

import { SiNavbarVerticalDividerComponent } from './si-navbar-vertical-divider.component';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  selector: 'si-navbar-vertical-header',
  imports: [SiNavbarVerticalDividerComponent],
  template: `
    @if (!navbar.collapsed()) {
      <div
        class="si-h5 text-secondary text-truncate"
        animate.leave="content-leave"
        [class.content]="initialized()"
      >
        <ng-content />
      </div>
    } @else {
      <si-navbar-vertical-divider animate.leave="divider-leave" [class.divider]="initialized()" />
    }
  `,
  styleUrl: './si-navbar-vertical-header.component.scss',
  host: {
    '[class.collapsed]': 'navbar.collapsed()'
  }
})
export class SiNavbarVerticalHeaderComponent {
  protected readonly navbar = inject(SI_NAVBAR_VERTICAL);
  protected readonly initialized = signal(false);

  constructor() {
    afterNextRender(() => {
      // Only enable transitions after the first render to avoid unwanted animations on load
      this.initialized.set(true);
    });
  }
}
