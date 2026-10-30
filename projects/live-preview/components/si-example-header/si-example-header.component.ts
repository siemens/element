/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, output } from '@angular/core';

import type { ExampleTab } from '../../services/example-route-controller.service';

@Component({
  selector: 'si-example-header',
  template: `
    <div class="wrapper">
      <ng-content />
      @if (tabs().length > 1) {
        <div class="tab-wrapper">
          <div role="tablist" aria-label="Examples" class="nav lp-tabs">
            @for (tab of tabs(); track $index) {
              <button
                type="button"
                role="tab"
                class="tab-item tab-link focus-inside"
                [class.tab-active]="activeTabIndex() === $index"
                [attr.aria-selected]="activeTabIndex() === $index"
                (click)="tabSelected.emit($index)"
              >
                {{ tab.heading }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './si-example-header.component.scss'
})
export class SiExampleHeaderComponent {
  readonly tabs = input.required<ExampleTab[]>();
  readonly activeTabIndex = input.required<number>();
  readonly tabSelected = output<number>();
}
