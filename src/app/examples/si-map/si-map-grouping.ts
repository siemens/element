/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPalette, MapPoint, SiMapComponent } from '@siemens/maps-ng';
import { mockGroupedPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiMapComponent],
  templateUrl: './si-map-grouping.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  readonly map = viewChild.required(SiMapComponent);

  points: MapPoint[] = mockGroupedPoints;
  maptilerKey = environment.maptilerKey;
  styleJson = environment.maptilerUrl;

  groupColorKey = 'status';
  groupColors: Record<string, Record<number, string> | ColorPalette> = {
    element: 'element',
    status: 'status',
    custom: { 1: 'red', 2: 'black', 3: 'yellow' }
  };

  refresh(): void {
    this.map().refresh(mockGroupedPoints);
  }

  select(): void {
    this.map().select(mockGroupedPoints[0]);
  }

  clear(): void {
    this.map().clear();
  }
}
