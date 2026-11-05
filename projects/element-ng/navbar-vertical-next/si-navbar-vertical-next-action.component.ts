/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { elementLeft4 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Optional leading navigation action for the inline-collapsible vertical navbar.
 * Multiple actions can be projected; they are rendered in order before the toggle.
 *
 * @example
 * ```html
 * <button
 *   type="button"
 *   si-navbar-vertical-next-action
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
  template: '<si-icon class="flip-rtl" [icon]="icon()" /><ng-content />',
  host: {
    class: 'btn btn-icon btn-ghost'
  }
})
export class SiNavbarVerticalNextActionComponent {
  protected readonly icons = addIcons({ elementLeft4 });

  /**
   * Icon displayed by the navigation action.
   *
   * @defaultValue this.icons.elementLeft4
   */
  readonly icon = input(this.icons.elementLeft4);
}
