/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { elementHelp } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiPopoverDirective } from '@siemens/element-ng/popover';

/**
 * This component creates a help button that shows contextual help in a popover.
 *
 * @example
 * ```html
 * <button
 *   type="button"
 *   si-help-button
 *   siHelpTitle="Help for problem"
 *   siHelpContent="Use your imagination to solve this problem."
 * >
 *   <!-- This text is only visible to screen reader. Provide a meaningful text, not only "help" -->
 *   How to solve the problem?
 * </button>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-help-button]',
  imports: [SiIconComponent],
  template: `
    <div class="visually-hidden"><ng-content /></div>
    <si-icon [icon]="icons.elementHelp" />
  `,
  styleUrl: './si-help-button.component.scss',
  hostDirectives: [
    {
      directive: SiPopoverDirective,
      inputs: [
        'siPopoverTitle:siHelpTitle',
        'siPopover:siHelpContent',
        'siPopoverContext:siHelpContext',
        'siPopoverPlacement:siHelpPlacement'
      ]
    }
  ]
})
export class SiHelpButtonComponent {
  protected icons = addIcons({ elementHelp });
}
