/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { click } from 'ol/events/condition';
import { createEmpty as createEmptyExtent, extend } from 'ol/extent';
import Feature from 'ol/Feature';
import Select, { SelectEvent } from 'ol/interaction/Select';
import { StyleLike } from 'ol/style/Style';

export class SelectCluster extends Select {
  private zoomOnClick: () => boolean;
  private maxZoom: () => number;
  private fitClusterPadding: () => number[];

  constructor(options: {
    fitClusterPadding: () => number[];
    maxZoom: () => number;
    style?: StyleLike | null;
    zoomOnClick: () => boolean;
  }) {
    super({ ...options, condition: click });

    this.zoomOnClick = options.zoomOnClick;
    this.maxZoom = options.maxZoom;
    this.fitClusterPadding = options.fitClusterPadding;
    this.on('select', this.selectCluster.bind(this));
  }

  selectCluster(e: SelectEvent): void {
    const feature = e.selected.at(0);

    // Not a cluster (or just one feature)
    const cluster = feature?.get('features');
    if (!cluster || cluster.length === 1) {
      return;
    }

    if (this.zoomOnClick()) {
      this.zoomToCluster(cluster);
    }
  }

  zoomToCluster(cluster: Feature[]): void {
    const extent = createEmptyExtent();
    cluster.forEach(feature => {
      const geometry = feature.getGeometry();
      if (geometry) {
        extend(extent, geometry.getExtent());
      }
    });

    this.getMap()!.getView().fit(extent, {
      padding: this.fitClusterPadding(),
      maxZoom: this.maxZoom()
    });
  }
}
