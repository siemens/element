/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, InjectionToken, input } from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

export const LOADING_SPINNER_BLOCKING = new InjectionToken<boolean>('isBlockingSpinner');
export const LOADING_SPINNER_OVERLAY = new InjectionToken<boolean>('isSpinnerOverlay');

@Component({
  selector: 'si-loading-spinner',
  imports: [SiTranslatePipe],
  templateUrl: './si-loading-spinner.component.html',
  styleUrl: './si-loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'animate.leave': 'spinner-leave'
  }
})
export class SiLoadingSpinnerComponent {
  /**
   * @defaultValue
   * ```
   * inject(LOADING_SPINNER_BLOCKING, { optional: true })
   * ```
   */
  readonly isBlockingSpinner = input(inject(LOADING_SPINNER_BLOCKING, { optional: true }));
  /**
   * @defaultValue
   * ```
   * inject(LOADING_SPINNER_OVERLAY, { optional: true })
   * ```
   */
  readonly isSpinnerOverlay = input(inject(LOADING_SPINNER_OVERLAY, { optional: true }));
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
