/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { animate, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  InjectionToken,
  input
} from '@angular/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
export const LOADING_SPINNER_BLOCKING = new InjectionToken<boolean>('isBlockingSpinner');
export const LOADING_SPINNER_OVERLAY = new InjectionToken<boolean>('isSpinnerOverlay');

@Component({
  selector: 'si-loading-spinner',
  imports: [SiTranslateModule],
  templateUrl: './si-loading-spinner.component.html',
  styleUrl: './si-loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-in')]),
      transition(':leave', animate('200ms ease-out', style({ opacity: 0 })))
    ])
  ]
})
export class SiLoadingSpinnerComponent {
  @HostBinding('@fadeAnimation') protected fadeAnimation = '';
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
   * $localize`:@@SI_LOADING_SPINNER.LABEL:Loading`
   * ```
   */
  readonly ariaLabel = input($localize`:@@SI_LOADING_SPINNER.LABEL:Loading`);
}
