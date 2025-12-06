/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import {
  ClusterPointDirective,
  ControlComponent,
  EventData,
  GeoJSONSourceComponent,
  MapComponent,
  MarkerComponent,
  MarkersForClustersComponent,
  NavigationControlDirective,
  PointDirective,
  PopupComponent
} from '@maplibre/ngx-maplibre-gl';
import { LOG_EVENT } from '@siemens/live-preview';
import { MapPoint } from '@siemens/maps-ng';
import { themeElement } from '@siemens/maps-ng/src/components/si-map/shared';
import { mockPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

import { DonutChartGroupingComponent } from './donut-chart-grouping.component';
import { styleJson } from './map-style';
import { MarkerIconComponent } from './marker-icon';

const buildGeoJSON = (points: MapPoint[]): GeoJSON.GeoJSON => {
  const features = [];
  for (const point of points) {
    const props: Record<string, any> = {};
    // Copy all properties except functions
    for (const propKey in point) {
      if (typeof point[propKey as keyof MapPoint] !== 'function') {
        props[propKey] = point[propKey as keyof MapPoint];
      }
    }

    // Create new feature
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lon, point.lat]
      },
      properties: {
        ...props,
        group: point.group ?? 0
      }
    } as GeoJSON.Feature;
    features.push(feature);
  }

  return { type: 'FeatureCollection', features };
};

@Component({
  selector: 'app-sample',
  imports: [
    ClusterPointDirective,
    ControlComponent,
    GeoJSONSourceComponent,
    DonutChartGroupingComponent,
    MapComponent,
    MarkerComponent,
    MarkersForClustersComponent,
    NavigationControlDirective,
    PointDirective,
    PopupComponent,
    MarkerIconComponent
  ],
  templateUrl: './map-cluster.html',
  styleUrl: './map-cluster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-100 d-flex flex-column p-5',
    '(window:theme-switch)': 'changeTheme($event)'
  }
})
export class SampleComponent {
  protected readonly map = viewChild.required(MapComponent);
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly geoJson = signal(buildGeoJSON(mockPoints));
  protected readonly mapStyle = signal(styleJson(environment.maptilerKey));
  readonly selectedCluster = signal<{
    geometry: GeoJSON.Point;
    properties: any;
  } | null>(null);
  protected readonly groupColors = { 1: 'red', 2: 'green', 3: 'blue', 4: 'black' };
  protected readonly style = themeElement.style();

  // Cluster properties configuration to aggregate groups
  // This will allow to create a donut chart based on group counts.
  protected readonly clusterProperties = {
    group1: ['+', ['case', ['==', ['get', 'group'], 1], 1, 0]],
    group2: ['+', ['case', ['==', ['get', 'group'], 2], 1, 0]],
    group3: ['+', ['case', ['==', ['get', 'group'], 3], 1, 0]],
    group4: ['+', ['case', ['==', ['get', 'group'], 4], 1, 0]]
  };

  refresh(): void {}

  select(): void {}

  clear(): void {}

  protected selectCluster(event: MouseEvent, feature: any): void {
    event.stopPropagation(); // This is needed, otherwise the popup will close immediately
    // Change the ref, to trigger mgl-popup onChanges (when the user click on the same cluster)
    this.selectedCluster.set({
      geometry: feature.geometry,
      properties: feature.properties
    });
  }

  protected async getImage(event: { id: string } & EventData): Promise<void> {
    const { id } = event;
    this.logEvent('missing image with id', id);
  }

  protected onError(event: ErrorEvent & EventData): void {
    if (event.error.message) {
      this.logEvent('map error', event.error.message);
    } else {
      this.logEvent('map error', event.error);
    }
  }

  protected changeTheme(event: Event): void {
    this.mapStyle.set(styleJson(environment.maptilerKey, (event as CustomEvent).detail.dark));
  }

  toString(value: any): string {
    return JSON.stringify(value.properties, null, 2);
  }
}
