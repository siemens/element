/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import {
  AttributionControlDirective,
  ControlComponent,
  EventData,
  FullscreenControlDirective,
  GeolocateControlDirective,
  GlobeControlDirective,
  MapComponent,
  MarkersForClustersComponent,
  NavigationControlDirective,
  PointDirective,
  Position,
  ScaleControlDirective
} from '@maplibre/ngx-maplibre-gl';
import {
  injectSiMapStyle,
  injectSiMapTranslations,
  ClusterPoint,
  SiClusterSourceComponent,
  SiStatusMarkerComponent
} from '@siemens/element-ng/maplibre';
import { LOG_EVENT } from '@siemens/live-preview';
import { MapPoint } from '@siemens/maps-ng';

import { environment } from '../../../environments/environment';
import { mockPoints } from '../../mocks/points.mock';

const buildGeoJSON = (points: MapPoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
  type: 'FeatureCollection',
  features: points.map(point => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [point.lon, point.lat]
    },
    properties: {
      description: point.description,
      group: point.group,
      marker: point.marker?.type ?? 'default',
      name: point.name,
      status: point.marker?.status
    }
  }))
});

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ControlComponent,
    FullscreenControlDirective,
    GeolocateControlDirective,
    GlobeControlDirective,
    MapComponent,
    MarkersForClustersComponent,
    NavigationControlDirective,
    PointDirective,
    ScaleControlDirective,
    SiClusterSourceComponent,
    SiStatusMarkerComponent
  ],
  templateUrl: './maplibre-cluster.html',
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);
  protected readonly mapTranslations = injectSiMapTranslations();

  protected readonly geoJson = buildGeoJSON(mockPoints);

  protected selectCluster(feature: ClusterPoint): void {
    this.logEvent('cluster click', feature.properties);
  }

  protected onError(event: ErrorEvent & EventData): void {
    if (event.error.message) {
      this.logEvent('map error', event.error.message);
    } else {
      this.logEvent('map error', event.error);
    }
  }

  protected onGeolocate(position: Position): void {
    this.logEvent('geolocate', position);
  }
}
