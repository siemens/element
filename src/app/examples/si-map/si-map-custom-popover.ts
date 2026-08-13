/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input, viewChild } from '@angular/core';
import { MapPoint, MapPointMetaData, SiMapComponent } from '@siemens/maps-ng';

import { environment } from '../../../environments/environment';
import { mockPoints, singlePoint } from '../../mocks/points.mock';

@Component({
  selector: 'app-custom-popover',
  template: `
    <h1>{{ mapPoint().name }}</h1>
    <small>This is a custom popover component.</small>
    <div [innerHTML]="mapPoint().description"></div>
    <table>
      <thead><th>label</th><th>value</th></thead>
      <tr>
        <td>{{ mapPoint().extraProperties?.label ?? 'N/A' }}</td>
        <td>{{ mapPoint().extraProperties?.value ?? 'N/A' }}</td>
      </tr>
    </table>
  `
})
export class CustomPopoverComponent {
  readonly mapPoint = input.required<MapPointMetaData>();
}

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-custom-popover.html',
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  readonly map = viewChild.required(SiMapComponent);

  points: MapPoint[] = mockPoints;
  maptilerKey = environment.maptilerKey;
  styleJson = environment.maptilerUrl;

  popoverComponent = CustomPopoverComponent;

  refresh(): void {
    this.map().refresh(this.points);
  }

  select(): void {
    this.map().select(singlePoint);
  }

  clear(): void {
    this.map().clear();
  }

  initial(): void {
    this.map().refresh(mockPoints);
  }
}
