/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input, output, signal } from '@angular/core';
import {
  ClusterPointDirective,
  GeoJSONSourceComponent,
  MarkersForClustersComponent
} from '@maplibre/ngx-maplibre-gl';

import type { ClusterColors, ClusterPoint } from './cluster-types';
import { createClusterConfiguration } from './cluster.utils';
import { SiClusterMarkerComponent } from './si-cluster-marker.component';

const EMPTY_DATA: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: []
};

/**
 * Adds a clustered GeoJSON source to a MapLibre map and renders interactive cluster markers.
 *
 * Cluster markers display the number of contained points and their distribution by group. Status
 * segments can be enabled for ungrouped points by providing `statusProperty`. Render individual,
 * unclustered points separately with `mgl-markers-for-clusters` using the same source ID.
 * Positive numeric groups always take precedence over status segments. Status segments apply only
 * when the normalized group value is zero; points without a matching group or status use the
 * ungrouped color.
 *
 * @example Basic usage
 * ```html
 * <mgl-map [mapStyle]="mapStyle()">
 *   <si-cluster-source
 *     sourceId="locations"
 *     statusProperty="status"
 *     [data]="locations"
 *     (clusterClick)="onClusterClick($event)"
 *   />
 *
 *   <mgl-markers-for-clusters source="locations">
 *     <ng-template let-feature mglPoint>
 *       <si-status-marker
 *         [status]="feature.properties?.status"
 *       />
 *     </ng-template>
 *   </mgl-markers-for-clusters>
 * </mgl-map>
 * ```
 *
 * @experimental
 */
@Component({
  selector: 'si-cluster-source',
  imports: [
    ClusterPointDirective,
    GeoJSONSourceComponent,
    MarkersForClustersComponent,
    SiClusterMarkerComponent
  ],
  templateUrl: './si-cluster-source.component.html'
})
export class SiClusterSourceComponent {
  /** ID used to register the generated GeoJSON source in MapLibre. */
  readonly sourceId = input.required<string>();
  /**
   * Point feature collection to cluster.
   * @defaultValue EMPTY_DATA
   */
  readonly data = input<GeoJSON.FeatureCollection<GeoJSON.Point>>(EMPTY_DATA);
  /**
   * Feature property containing the positive numeric group ID.
   * @defaultValue 'group'
   */
  readonly groupProperty = input('group');
  /**
   * Built-in palette or exact colors indexed by group ID. The built-in `'status'` palette contains
   * four colors for numeric groups and is separate from status-based bucketing.
   * @defaultValue 'status'
   */
  readonly groupColors = input<ClusterColors>('status');
  /**
   * Top-level feature property containing a {@link MarkerStatus} value. Status bucketing is
   * disabled by default and only applies when the normalized group value is zero. Missing or
   * unsupported status values, and groups that do not match a configured bucket, use the ungrouped
   * color. Built-in colors match `SiStatusMarkerComponent`, with `default` using accent and
   * `unknown` using neutral.
   * @defaultValue undefined
   * @see https://maplibre.org/maplibre-style-spec/sources/#clusterproperties
   */
  readonly statusProperty = input<string | undefined>();
  /**
   * Cluster radius in pixels.
   * @defaultValue 50
   */
  readonly clusterRadius = input(50);
  /**
   * Maximum zoom at which points are clustered.
   * @defaultValue undefined
   */
  readonly clusterMaxZoom = input<number | undefined>(undefined);
  /**
   * Minimum number of points required to form a cluster.
   * @defaultValue 2
   */
  readonly clusterMinPoints = input(2);

  /** Emits when a cluster marker is activated. */
  readonly clusterClick = output<ClusterPoint>();

  protected readonly clusterConfiguration = computed(() =>
    createClusterConfiguration(this.groupColors(), this.groupProperty(), this.statusProperty())
  );
  /** Stores selection for the projected cluster-popover integration. */
  protected readonly selectedCluster = signal<ClusterPoint | undefined>(undefined);

  protected async selectCluster(feature: ClusterPoint): Promise<void> {
    this.clusterClick.emit(feature);
    this.selectedCluster.set({ ...feature, geometry: feature.geometry });
  }
}
