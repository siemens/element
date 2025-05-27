/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiLoadingSpinnerComponent } from './si-loading-spinner.component';

@Component({
  selector: 'si-loading-button',
  templateUrl: './si-loading-button.component.html',
  styleUrl: './si-loading-button.component.scss',
  imports: [SiLoadingSpinnerComponent, NgClass, SiTranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.pe-none]': 'disabled()'
  }
})
export class SiLoadingButtonComponent {
  /**
   * Whether the button is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Whether the loading state should be displayed.
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /**
   * Type of the button.
   * @defaultValue 'button'
   **/
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** aria-label for the button */
  readonly ariaLabel = input<TranslatableString>();
  /** aria-labelledby for the button */
  readonly ariaLabelledBy = input<string>();
  /**
   * CSS class for the button.
   * @defaultValue ''
   */
  readonly buttonClass = input('');

  protected handleClick(event: Event): void {
    if (this.disabled() || this.loading()) {
      event.stopPropagation();
    }
  }
}
