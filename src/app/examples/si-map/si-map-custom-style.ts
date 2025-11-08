/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { MapPoint, SiMapComponent } from '@siemens/maps-ng';
import { mockPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-custom-style.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  readonly map = viewChild.required(SiMapComponent);

  points: MapPoint[] = mockPoints;
  groupColors: Record<number, string> = {
    1: 'red',
    2: 'green',
    3: 'blue'
  };
  styleJson = environment.maptilerUrl;

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
