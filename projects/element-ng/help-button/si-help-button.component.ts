/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input } from '@angular/core';
import { addIcons, elementHelp, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiPopoverNextDirective } from '@siemens/element-ng/popover-next';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-help-button',
  imports: [SiIconNextComponent, SiTranslatePipe],
  template: `
    <div class="visually-hidden">{{ ariaHelpLabel() | translate }}</div>
    <si-icon-next [icon]="icons.elementHelp" />
  `,
  styleUrl: './si-help-button.component.scss',
  host: {
    role: 'button',
    '[class.disabled]': 'disabled()',
    '[tabindex]': 'disabled() ? 0 : -1',
    '[attr.aria-disabled]': 'disabled()'
  },
  hostDirectives: [
    {
      directive: SiPopoverNextDirective,
      inputs: [
        'popoverTitle:helpTitle',
        'siPopoverNext:helpContent',
        'popoverContext:helpContext',
        'placement:helpPlacement'
      ]
    }
  ]
})
export class SiHelpButtonComponent {
  protected icons = addIcons({ elementHelp });

  /**
   * Visually hidden label of the button for screen reader.
   * Provide a meaningful text the describes for what the help is provided.
   *
   * @example How to find my booking number
   */
  readonly ariaHelpLabel = input.required<TranslatableString>();

  /** @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });
}
