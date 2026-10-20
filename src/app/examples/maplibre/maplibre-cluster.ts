/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
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
import { provideSiFormFieldConfig, SiFormFieldComponent } from '@siemens/element-ng/form';
import {
  injectSiMapStyle,
  injectSiMapTranslations,
  ClusterPoint,
  SiClusterPopoverComponent,
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
    FormField,
    FullscreenControlDirective,
    GeolocateControlDirective,
    GlobeControlDirective,
    MapComponent,
    MarkersForClustersComponent,
    NavigationControlDirective,
    PointDirective,
    ScaleControlDirective,
    SiClusterPopoverComponent,
    SiClusterSourceComponent,
    SiFormFieldComponent,
    SiStatusMarkerComponent
  ],
  templateUrl: './maplibre-cluster.html',
  providers: [provideSiFormFieldConfig()],
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);
  protected readonly mapTranslations = injectSiMapTranslations();

  protected readonly geoJson = buildGeoJSON(mockPoints);
  protected readonly zoomOnClick = signal(true);
  protected readonly zoomOnClickField = form(this.zoomOnClick);

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
