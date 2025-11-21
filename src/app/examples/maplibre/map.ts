/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ControlComponent,
  MapComponent,
  MarkerComponent,
  NavigationControlDirective
} from '@maplibre/ngx-maplibre-gl';
import { LOG_EVENT } from '@siemens/live-preview';
import { mockPoints } from 'src/app/mocks/points.mock';

@Component({
  selector: 'app-sample',
  imports: [MapComponent, ControlComponent, MarkerComponent, NavigationControlDirective],
  templateUrl: './map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly points = signal(mockPoints);

  refresh(): void {}

  select(): void {}

  clear(): void {}
}
