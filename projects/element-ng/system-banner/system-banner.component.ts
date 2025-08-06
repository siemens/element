/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ExtendedStatusType } from '@spike-rabbit/element-ng/common';
import { SiTranslatePipe, TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

/**
 * The system banner component displays a message with specific status as background.
 * Use this component for displaying system level messages on top of the page.
 */
@Component({
  selector: 'si-system-banner',
  imports: [SiTranslatePipe],
  templateUrl: './system-banner.component.html',
  styleUrl: './system-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'bannerClass()'
  }
})
export class SiSystemBannerComponent {
  /**
   * Status of the system banner.
   * Possible values are 'info', 'success', 'warning', 'caution', 'danger', 'critical'.
   *
   * @defaultValue 'info'
   */
  readonly status = input<ExtendedStatusType>('info');
  /**
   * Message to be displayed in the system banner.
   */
  readonly message = input.required<TranslatableString>();

  protected readonly bannerClass = computed(() => `banner-${this.status()}`);
}
