/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Optional leading navigation action for the inline-collapsible vertical navbar.
 * Multiple actions can be projected; they are rendered in order before the toggle.
 * Always provide an `aria-label`. When used on an `<a>`, set `href` or `routerLink` to keep it focusable.
 *
 * @example
 * ```html
 * <button
 *   type="button"
 *   si-navbar-vertical-next-action
 *   icon="element-left-4"
 *   aria-label="Back"
 *   (click)="back()"
 * ></button>
 * ```
 *
 * @experimental
 */
@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[si-navbar-vertical-next-action], a[si-navbar-vertical-next-action]',
  imports: [SiIconComponent],
  template: '<si-icon class="flip-rtl" [icon]="icon()" />',
  host: {
    class: 'btn btn-icon btn-ghost'
  }
})
export class SiNavbarVerticalNextActionComponent {
  /**
   * Icon displayed by the navigation action.
   */
  readonly icon = input.required<string>();
}
