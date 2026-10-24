/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {
  ClusterPointDirective,
  GeoJSONSourceComponent,
  MapService,
  MarkersForClustersComponent
} from '@maplibre/ngx-maplibre-gl';
import type { EaseToOptions } from 'maplibre-gl';

import type { ClusterColors, ClusterPoint } from './cluster-types';
import { createClusterBox, createClusterConfiguration } from './cluster.utils';
import { SiClusterMarkerComponent } from './si-cluster-marker.component';

const EMPTY_DATA: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: []
};

// Keeps the 46px cluster markers and their focus ring clear of the viewport edges.
const ZOOM_PADDING = 40;
// Ignores zoom gains that are too small to reveal anything.
const ZOOM_EPSILON = 0.01;
// MapLibre clusters up to `maxzoom - 1`, with a default source `maxzoom` of 18.
// @see https://maplibre.org/maplibre-style-spec/sources/#clustermaxzoom
const DEFAULT_CLUSTER_MAX_ZOOM = 17;

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
 * Clicking a cluster frames all of its children and zooms in as far as possible while they stay
 * visible, up to the zoom at which points stop being clustered. Clusters whose children stay
 * within `clusterRadius` until then emit `clusterClick` instead, which opens a projected
 * `si-cluster-popover`.
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
  private readonly mapService = inject(MapService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

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
  /**
   * Frames the children of a clicked cluster and zooms in as far as possible while they stay
   * visible. Clusters whose children cannot be pulled apart emit `clusterClick` instead.
   * @defaultValue true
   */
  readonly zoomOnClick = input(true, { transform: booleanAttribute });
  /**
   * Highest zoom used to expand a cluster. Clusters whose children stay within `clusterRadius`
   * up to this zoom emit `clusterClick` instead of zooming. Defaults to `clusterMaxZoom`,
   * because points stop being clustered above it.
   * @defaultValue undefined
   */
  readonly zoomMaxLevel = input<number | undefined>(undefined);
  /**
   * Emits when a cluster marker is activated and the click did not expand the cluster, either
   * because `zoomOnClick` is disabled or because the children cannot be pulled apart.
   */
  readonly clusterClick = output<ClusterPoint>();

  protected readonly clusterConfiguration = computed(() =>
    createClusterConfiguration(this.groupColors(), this.groupProperty(), this.statusProperty())
  );

  /** Stores selection for the projected cluster-popover integration. */
  protected readonly selectedCluster = signal<ClusterPoint | undefined>(undefined);

  private readonly source = viewChild.required(GeoJSONSourceComponent);
  private clickToken = 0;

  /**
   * Returns a page of original points belonging to a cluster.
   * @see https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/#getclusterleaves
   */
  getClusterLeaves(clusterId: number, limit: number, offset: number): Promise<ClusterPoint[]> {
    return this.source().getClusterLeaves(clusterId, limit, offset) as Promise<ClusterPoint[]>;
  }

  protected async onClusterClick(cluster: ClusterPoint): Promise<void> {
    if (!this.zoomOnClick()) {
      this.clusterClick.emit(cluster);
      return;
    }

    const token = ++this.clickToken;
    const children = await this.getSeparableChildren(cluster);
    if (token !== this.clickToken || this.destroyRef.destroyed) {
      return;
    }

    const camera = this.getExpansionCamera(children);
    if (camera) {
      this.zoomToChildren(camera);
    } else {
      this.clusterClick.emit(cluster);
    }
  }

  /** Descends into clusters that do not split yet, so a click never zooms without an effect. */
  private async getSeparableChildren(cluster: ClusterPoint): Promise<ClusterPoint[]> {
    let children = await this.getClusterChildren(cluster);
    while (children.length === 1 && children[0].properties?.cluster) {
      children = await this.getClusterChildren(children[0]);
    }
    return children;
  }

  private getClusterChildren(cluster: ClusterPoint): Promise<ClusterPoint[]> {
    return this.source().getClusterChildren(Number(cluster.properties?.cluster_id)) as Promise<
      ClusterPoint[]
    >;
  }

  /**
   * Returns the camera that reveals the children, or `undefined` when zooming cannot reveal them.
   * The children are framed instead of the cluster, whose coordinates are the weighted centroid
   * quantized to the tile grid and would push outlying children out of the viewport.
   */
  private getExpansionCamera(children: readonly ClusterPoint[]): EaseToOptions | undefined {
    const map = this.mapService.mapInstance;
    const container = map.getContainer();
    const currentZoom = map.getZoom();
    const box = createClusterBox(
      children.map(child => {
        const [longitude, latitude] = child.geometry.coordinates;
        return map.project([longitude, latitude]);
      })
    );
    // Above the clustering zoom the source renders plain markers that would stack on top of each
    // other, so children that stay within the cluster radius until then are left to the popover.
    const maxZoom =
      this.zoomMaxLevel() ??
      Math.min(map.getMaxZoom(), this.clusterMaxZoom() ?? DEFAULT_CLUSTER_MAX_ZOOM);
    const separationZoom =
      currentZoom + Math.log2(this.clusterRadius() / Math.max(box.size.x, box.size.y));
    if (separationZoom > maxZoom) {
      return undefined;
    }

    const zoom = Math.min(
      currentZoom +
        Math.log2(
          Math.min(
            (container.clientWidth - 2 * ZOOM_PADDING) / box.size.x,
            (container.clientHeight - 2 * ZOOM_PADDING) / box.size.y
          )
        ),
      maxZoom
    );
    return zoom > currentZoom + ZOOM_EPSILON
      ? { center: map.unproject([box.center.x, box.center.y]), zoom }
      : undefined;
  }

  private zoomToChildren(camera: EaseToOptions): void {
    const map = this.mapService.mapInstance;
    // Markers are recycled by index, so the activated marker can be gone once the zoom settles.
    // Reduced motion can emit `moveend` synchronously, so register before starting the transition.
    map.once('moveend', () =>
      afterNextRender(
        () => {
          if (this.document.activeElement === this.document.body) {
            map.getCanvas().focus({ preventScroll: true });
          }
        },
        { injector: this.injector }
      )
    );
    // MapLibre skips the animation when `prefers-reduced-motion` is set.
    map.easeTo(camera);
  }
}
