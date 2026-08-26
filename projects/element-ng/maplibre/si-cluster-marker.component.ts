/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input, output } from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { ClusterPoint, ClusterSegment } from './cluster-types';
import { createClusterGradient } from './cluster.utils';

/**
 * Renders an interactive marker for a MapLibre cluster.
 *
 * The marker displays the total number of clustered points and visualizes their group distribution
 * as colored segments. It is created internally by `SiClusterSourceComponent`.
 *
 * @internal
 */
@Component({
  selector: 'si-cluster-marker',
  imports: [SiTranslatePipe],
  templateUrl: './si-cluster-marker.component.html',
  styleUrl: './si-cluster-marker.component.scss'
})
export class SiClusterMarkerComponent {
  /** Cluster feature represented by this marker. */
  readonly feature = input.required<ClusterPoint>();

  /** Colored segments that represent the grouped points in the cluster. */
  readonly segments = input.required<readonly ClusterSegment[]>();

  /** Emits when the marker is activated. */
  readonly markerClick = output<void>();

  protected readonly count = computed(() => Number(this.feature().properties?.point_count) || 0);
  protected readonly countLabel = computed(() => (this.count() > 99 ? '99+' : `${this.count()}`));
  protected readonly clusterLabel = t(
    () => $localize`:@@SI_MAP_CLUSTER.LABEL:Cluster with {{count}} locations`
  );

  protected readonly gradient = computed(() =>
    createClusterGradient(this.feature(), this.segments())
  );

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.markerClick.emit();
  }
}
