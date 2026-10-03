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

/**
 * Context supplied to custom cluster popover templates, including all locations loaded so far.
 *
 * @experimental
 */
export interface ClusterPopoverContext {
  /** All loaded original point features, exposed by an unqualified `let-features` binding. */
  $implicit: readonly ClusterPoint[];
  /** The same accumulated features as `$implicit`, exposed by `let-features="features"`. */
  features: readonly ClusterPoint[];
  /** Total number of locations in the selected cluster, including locations not yet loaded. */
  total: number;
  /** Whether the initial batch, an additional batch, or a retry is being loaded. */
  loading: boolean;
  /** Error from a failed batch request, or `undefined` when no error is available. */
  error: unknown;
  /** Selected cluster feature, including its `cluster_id` and `point_count` properties. */
  cluster: ClusterPoint;
  /** Closes the popover using the same behavior as its Close button. */
  close: () => void;
}
