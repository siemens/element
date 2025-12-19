/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { MapPoint, MapPointMetaData, SiMapComponent } from '@siemens/maps-ng';
import { mockPoints, singlePoint } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-custom-popover-onhover',
  template: `
    <h1>{{ mapPoint().name }}</h1>
    <small>This is a custom popover component on hover.</small>
    <div [innerHTML]="mapPoint().description"></div>
    <table>
      <thead><th>label</th><th>value</th></thead>
      <tr>
        <td>{{ $any(mapPoint()).extraProps?.label ?? 'N/A' }}</td>
        <td>{{ $any(mapPoint()).extraProps?.value ?? 'N/A' }}</td>
      </tr>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomPopoverComponent {
  readonly mapPoint = input.required<MapPointMetaData>();
}

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-custom-popover-onhover.html',
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
