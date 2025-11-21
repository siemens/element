/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import {
  AttributionControlDirective,
  ClusterPointDirective,
  ControlComponent,
  EventData,
  GeoJSONSourceComponent,
  GeolocateControlDirective,
  MapComponent,
  MarkerComponent,
  MarkersForClustersComponent,
  NavigationControlDirective,
  PointDirective,
  PopupComponent,
  Position
} from '@maplibre/ngx-maplibre-gl';
import {
  observeStyleJson,
  observeTranslations,
  SiMarkerIconComponent
} from '@siemens/element-ng/maplibre';
import { LOG_EVENT } from '@siemens/live-preview';
import { mockPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

import { DonutChartGroupingComponent } from './donut-chart-grouping.component';
import { buildGeoJSON } from './geo-json-utils';

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ClusterPointDirective,
    ControlComponent,
    GeoJSONSourceComponent,
    GeolocateControlDirective,
    DonutChartGroupingComponent,
    MapComponent,
    MarkerComponent,
    MarkersForClustersComponent,
    NavigationControlDirective,
    PointDirective,
    PopupComponent,
    SiMarkerIconComponent
  ],
  templateUrl: './map-cluster.html',
  styleUrl: './map-cluster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly map = viewChild.required(MapComponent);
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly geoJson = signal(buildGeoJSON(mockPoints));
  protected readonly mapStyle = observeStyleJson(environment.maptilerKey);
  protected readonly translations = observeTranslations();
  readonly selectedCluster = signal<{
    geometry: GeoJSON.Point;
    properties: any;
  } | null>(null);
  readonly selectedPoint = signal<{
    geometry: GeoJSON.Point;
    properties: any;
  } | null>(null);
  protected readonly groupColors = { 1: 'red', 2: 'green', 3: 'blue', 4: 'black' };

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
    this.selectedPoint.set(null);
    this.selectedCluster.set({
      geometry: feature.geometry,
      properties: feature.properties
    });
  }

  protected selectPoint(event: MouseEvent, feature: any): void {
    event.stopPropagation(); // This is needed, otherwise the popup will close immediately
    // Change the ref, to trigger mgl-popup onChanges (when the user click on the same point)
    this.selectedCluster.set(null);
    this.selectedPoint.set({
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

  protected onGeolocate(position: Position): void {
    this.logEvent('geolocate', position);
  }

  toString(value: any): string {
    return JSON.stringify(value.properties, null, 2);
  }
}
