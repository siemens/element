/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

export type ConnectionStrength = 'none' | 'low' | 'medium' | 'strong';

const CONNECTION_STRENGTH_MAP = { 'none': 0, 'low': 1, 'medium': 2, 'strong': 3 };

@Component({
  selector: 'si-connection-strength',
  templateUrl: './si-connection-strength.component.html',
  styleUrl: './si-connection-strength.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiConnectionStrengthComponent {
  /**
   * Shows the signal representation in an alternative *WLAN* format
   *
   * @defaultValue false
   */
  readonly wlan = input(false, { transform: booleanAttribute });
  /**
   * Main value representing the current connection strength.
   *
   * @defaultValue 'none'
   */
  readonly value = input<ConnectionStrength>('none');

  protected readonly numberValue = computed(() => CONNECTION_STRENGTH_MAP[this.value()] ?? 0);
}
