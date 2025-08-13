/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, viewChild } from '@angular/core';
import { LOG_EVENT } from '@siemens/live-preview';
import { MapPoint, SiMapComponent } from '@siemens/maps-ng';
import { mockPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-default-style.html',
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  readonly map = viewChild.required(SiMapComponent);

  points: MapPoint[] = mockPoints;
  maptilerKey = environment.maptilerKey;
  styleJson = environment.maptilerUrl;

  refresh(): void {
    this.map().refresh(mockPoints);
  }

  select(): void {
    this.map().select(mockPoints[10]);
  }

  clear(): void {
    this.map().clear();
  }
}
