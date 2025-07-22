/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';

import { SiNavbarVerticalDividerComponent } from './si-navbar-vertical-divider.component';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  selector: 'si-navbar-vertical-header',
  imports: [SiNavbarVerticalDividerComponent],
  template: `
    @if (!navbar.collapsed()) {
      <div class="si-title-2 text-secondary p-5">
        <ng-content />
      </div>
    } @else {
      <si-navbar-vertical-divider />
    }
  `,
  styleUrl: './si-navbar-vertical-header.component.scss',
  host: { '[@headerCollapse]': 'navbar.collapsed()' },
  animations: [
    trigger('headerCollapse', [
      // Prevents initial animation. See: https://stackoverflow.com/a/50791299
      transition(':enter', []),
      state('true', style({ blockSize: '13px' })),
      state('false', style({ blockSize: '40px' })),
      transition('* <=> *', [
        query('.si-title-2', style({ position: 'absolute' }), { optional: true }),
        group([
          query(
            ':leave',
            [style({ opacity: '1' }), animate('0.2s ease-in', style({ opacity: '0' }))],
            { optional: true }
          ),
          query(
            ':enter',
            [style({ opacity: '0' }), animate('0.2s 0.3s ease-out', style({ opacity: '1' }))],
            { optional: true }
          ),
          animate('0.5s ease')
        ])
      ])
    ])
  ]
})
export class SiNavbarVerticalHeaderComponent {
  protected navbar = inject(SI_NAVBAR_VERTICAL);
}
