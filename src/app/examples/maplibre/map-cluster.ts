/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ControlComponent,
  GeoJSONSourceComponent,
  ImageComponent,
  LayerComponent,
  MapComponent,
  MarkerComponent,
  NavigationControlDirective
} from '@maplibre/ngx-maplibre-gl';
import { LOG_EVENT } from '@siemens/live-preview';
import { MapPoint } from '@siemens/maps-ng';
import { mockPoints } from 'src/app/mocks/points.mock';

const buildGeoJSON = (points: MapPoint[]): GeoJSON.GeoJSON => {
  return {
    type: 'FeatureCollection',
    features: points.map(point => ({
      type: 'Feature',
      properties: { name: point.name, description: point.description, ...point.extraProperties },
      geometry: { type: 'Point', coordinates: [point.lon, point.lat] }
    }))
  };
};

@Component({
  selector: 'app-sample',
  imports: [
    ControlComponent,
    GeoJSONSourceComponent,
    MapComponent,
    LayerComponent,
    NavigationControlDirective,
    ImageComponent
  ],
  templateUrl: './map-cluster.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly geoJson = signal(buildGeoJSON(mockPoints));

  refresh(): void {}

  select(): void {}

  clear(): void {}
}
