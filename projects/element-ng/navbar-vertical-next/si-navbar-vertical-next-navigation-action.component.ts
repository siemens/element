/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { elementLeft4 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Optional leading navigation action for the inline-collapsible vertical navbar.
 *
 * @example
 * ```html
 * <button
 *   type="button"
 *   si-navbar-vertical-next-navigation-action
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
    'button[si-navbar-vertical-next-navigation-action], a[si-navbar-vertical-next-navigation-action]',
  imports: [SiIconComponent],
  template: '<si-icon class="flip-rtl" [icon]="icon()" /><ng-content />',
  host: {
    class: 'btn btn-icon btn-ghost'
  }
})
export class SiNavbarVerticalNextNavigationActionComponent {
  protected readonly icons = addIcons({ elementLeft4 });

  /**
   * Icon displayed by the navigation action.
   *
   * @defaultValue this.icons.elementLeft4
   */
  readonly icon = input(this.icons.elementLeft4);
}
