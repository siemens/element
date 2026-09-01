/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[si-content-action-bar-toggle]',
  imports: [SiIconComponent],
  templateUrl: './si-content-action-bar-toggle.component.html',
  styleUrl: '../menu/si-menu-item.component.scss',
  host: { class: 'btn btn-tertiary flex-grow-0 focus-inside' }
})
export class SiContentActionBarToggleComponent {
  /** Icon identifier rendered inside the toggle button. */
  readonly icon = input.required<string>();
}
