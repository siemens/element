/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import {
  AttributionControlDirective,
  ControlComponent,
  EventData,
  FullscreenControlDirective,
  MapComponent,
  MarkersForClustersComponent,
  NavigationControlDirective,
  PointDirective
} from '@maplibre/ngx-maplibre-gl';
import {
  ClusterPoint,
  injectSiMapStyle,
  injectSiMapTranslations,
  SiClusterSourceComponent,
  SiMaplibreClusterPopoverComponent,
  SiMaplibreClusterPopoverDirective,
  SiStatusMarkerComponent
} from '@siemens/element-ng/maplibre';
import { LOG_EVENT } from '@siemens/live-preview';

import { environment } from '../../../environments/environment';
import { mockPoints } from '../../mocks/points.mock';

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ControlComponent,
    FullscreenControlDirective,
    MapComponent,
    MarkersForClustersComponent,
    NavigationControlDirective,
    PointDirective,
    SiClusterSourceComponent,
    SiMaplibreClusterPopoverComponent,
    SiMaplibreClusterPopoverDirective,
    SiStatusMarkerComponent
  ],
  templateUrl: './maplibre-cluster-custom-popover.html',
  styleUrl: './maplibre-cluster-custom-popover.scss',
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);
  protected readonly mapTranslations = injectSiMapTranslations();
  protected readonly selectedFeature = signal<ClusterPoint | undefined>(undefined);
  protected readonly geoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: mockPoints.map((point, index) => ({
      type: 'Feature',
      id: index,
      geometry: {
        type: 'Point',
        coordinates: [point.lon, point.lat]
      },
      properties: {
        name: point.name,
        description: point.description,
        group: point.group,
        status: point.marker?.status
      }
    }))
  };

  protected selectFeature(feature: ClusterPoint): void {
    this.selectedFeature.set(feature);
    this.logEvent('select location', feature);
  }

  protected onError(event: ErrorEvent & EventData): void {
    if (event.error.message) {
      this.logEvent('map error', event.error.message);
    } else {
      this.logEvent('map error', event.error);
    }
  }
}
