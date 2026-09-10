/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { elementLeft4 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Back button for navigating from side-panel details to the previous view.
 *
 * @example
 * ```html
 * <button type="button" siSidePanelBackButton aria-label="Back" (click)="back()"></button>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[siSidePanelBackButton], a[siSidePanelBackButton]',
  imports: [SiIconComponent],
  template: '<si-icon class="flip-rtl" [icon]="icons.elementLeft4" /><ng-content />',
  host: {
    class: 'btn btn-icon btn-tertiary ms-4 auto-hide'
  }
})
export class SiSidePanelBackButtonComponent {
  protected readonly icons = addIcons({ elementLeft4 });
}
