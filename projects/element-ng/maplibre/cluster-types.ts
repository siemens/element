/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/** A point feature consumed by the clustered MapLibre source. */
export type ClusterPoint = GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>;

/**
 * Built-in group palette or exact colors indexed by positive group ID. The `'status'` palette is
 * the four-color palette used for numeric groups; it is separate from status-based bucketing.
 */
export type ClusterColors = 'status' | 'element' | Record<number, string>;

/** A rendered color segment and its generated cluster-property name. */
export interface ClusterSegment {
  // The color used to render the segment.
  color: string;
  // The generated cluster property name to count the points for this segment.
  property: string;
}
