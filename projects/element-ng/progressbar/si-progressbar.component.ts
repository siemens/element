/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-progressbar',
  imports: [SiTranslatePipe],
  templateUrl: './si-progressbar.component.html',
  styleUrl: './si-progressbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiProgressbarComponent {
  /**
   * Needed for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_PROGRESSBAR.LABEL:Progress`)
   * ```
   */
  readonly ariaLabel = input(t(() => $localize`:@@SI_PROGRESSBAR.LABEL:Progress`));

  /**
   * Max value for progressbar
   *
   * @defaultValue 100
   */
  readonly max = input(100);

  /**
   * Current value
   *
   * @defaultValue 0
   */
  readonly value = input<number | undefined>(0);

  /**
   * Heading to display on top of progress bar.
   */
  readonly heading = input<string>();

  /**
   * Optional progress text to be shown on top right (in LTR).
   * It can be percentage value or a progress status. E.g `50 %` or `Downloading 2/8`.
   */
  readonly progress = input<string>();

  /**
   * Height for progress bar.
   *
   * @defaultValue 'normal'
   */
  readonly height = input<ProgressbarHeight>('normal');

  protected readonly percent = computed(
    () => (100 * Number(this.value() ?? 0)) / Number(this.max() ?? 100)
  );
}

export type ProgressbarHeight = 'small' | 'normal';
