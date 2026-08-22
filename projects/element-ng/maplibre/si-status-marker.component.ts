/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';

export type MarkerStatus =
  'default' | 'unknown' | 'success' | 'info' | 'warning' | 'danger' | 'caution' | 'critical';

@Component({
  selector: 'si-status-marker',
  templateUrl: './si-status-marker.component.html',
  styleUrl: './si-status-marker.component.scss',
  host: {
    class: 'si-status-marker',
    role: 'button',
    '[attr.aria-label]': 'label()',
    '[attr.data-status]': 'status()'
  }
})
export class SiStatusMarkerComponent {
  /**
   * The aria-label for the marker.
   */
  readonly label = input.required<string>();
  /**
   * The status of the marker.
   * @defaultValue 'default'
   */
  readonly status = input<MarkerStatus>('default');
}
