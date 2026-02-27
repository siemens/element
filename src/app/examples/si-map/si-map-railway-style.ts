/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import { MapPoint, SiMapComponent, railwayStyle } from '@siemens/maps-ng';
import { mockPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-railway-style.html',
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  readonly map = viewChild.required(SiMapComponent);
  readonly style = railwayStyle(environment.maptilerKey);

  points: MapPoint[] = mockPoints;
  groupColors: Record<number, string> = {
    1: 'red',
    2: 'green',
    3: 'blue'
  };

  refresh(): void {
    this.points = mockPoints;
    this.map().refresh(mockPoints);
  }

  select(): void {
    this.map().select(this.points[10]);
  }

  clear(): void {
    this.map().clear();
  }
}
