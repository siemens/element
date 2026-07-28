/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input } from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-loading-spinner',
  imports: [SiTranslatePipe],
  templateUrl: './si-loading-spinner.component.html',
  styleUrl: './si-loading-spinner.component.scss',
  host: {
    'animate.leave': 'spinner-leave'
  }
})
export class SiLoadingSpinnerComponent {
  /**
   * @defaultValue false
   */
  readonly isBlockingSpinner = input(false, {
    transform: booleanAttribute
  });
  /**
   * @defaultValue false
   */
  readonly isSpinnerOverlay = input(false, {
    transform: booleanAttribute
  });
  /**
   * Needed for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LOADING_SPINNER.LABEL:Loading`)
   * ```
   */
  readonly ariaLabel = input(t(() => $localize`:@@SI_LOADING_SPINNER.LABEL:Loading`));
}
