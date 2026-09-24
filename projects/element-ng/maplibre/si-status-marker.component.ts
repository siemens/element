/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';

import type { MarkerStatus } from './marker-types';

@Component({
  selector: 'si-status-marker',
  templateUrl: './si-status-marker.component.html',
  styleUrl: './si-status-marker.component.scss',
  host: {
    class: 'si-status-marker',
    '[attr.data-status]': 'status() ?? "default"'
  }
})
export class SiStatusMarkerComponent {
  /**
   * The status of the marker.
   * @defaultValue 'default'
   */
  readonly status = input<MarkerStatus>('default');
}
