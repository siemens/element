/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[si-content-action-bar-toggle]',
  imports: [SiIconNextComponent],
  templateUrl: './si-content-action-bar-toggle.component.html',
  styleUrl: '../menu/si-menu-item.component.scss',
  host: { class: 'dropdown-item flex-grow-0 focus-inside' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiContentActionBarToggleComponent {
  readonly icon = input.required<string>();
}
