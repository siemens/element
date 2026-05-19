/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Skeleton loading state for the `<si-weather-widget-body>`. Not exported from
 * the public entry point.
 *
 * @internal
 */
@Component({
  selector: 'si-weather-widget-skeleton',
  template: `
    <div class="si-weather-widget-skeleton-row">
      <div class="si-weather-widget-skeleton-value si-skeleton"></div>
      <div class="si-weather-widget-skeleton-col">
        <div class="si-weather-widget-skeleton-illustration si-skeleton"></div>
        <div class="si-weather-widget-skeleton-line si-skeleton"></div>
        <div class="si-weather-widget-skeleton-line si-skeleton"></div>
      </div>
    </div>
  `,
  styleUrl: './si-weather-widget-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiWeatherWidgetSkeletonComponent {}
