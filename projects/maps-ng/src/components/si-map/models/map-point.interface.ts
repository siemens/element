/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/** */
export interface MapPoint extends MapPointMetaData {
  /**
   * Latitude value for marker
   */
  lat: number;
  /**
   * Longtitude value for marker
   */
  lon: number;
}

export interface MapPointMetaData {
  /**
   * Marker name
   */
  name: string;
  /**
   * Marker description, can be simple string or HTML as string
   */
  description: string;
  /**
   * Marker style
   */
  marker?: MarkerOptions;
  /**
   * Extra properties to be passed along (click function consumes it)
   */
  extraProperties?: any;
  /**
   * If you want your point to be clustered by it's group, you need to set the group id here for this point
   * Color with the same id will be assigned. Must be higher than 0
   */
  group?: number;
  /**
   * Click functionality, do any extra staff when clicking on the point, just create needed logic for click functionality
   */
  click?(extraProperties?: any): void;
}

// Note: keep in sync with @siemens/element-ng: ExtendedStatusType | 'default' | 'unknown;
// this doesn't use the Element type to be independent of element (for mobile)
export type MarkerStatusType =
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'caution'
  | 'critical'
  | 'default'
  | 'unknown';

export interface LabelOptions {
  /**
   * Text to display as label
   */
  text: string;
}

export interface MarkerOptions {
  /**
   * Visual representation of marker
   */
  type: 'icon' | 'dot' | 'status';
  /**
   * Color of the marker, HEX or css compliant color value. Only use when a semantic status
   * isn't working for the use-case.
   */
  color?: string;
  /**
   * Semantic status for coloring. This is also theme-aware.
   */
  status?: MarkerStatusType;
  /**
   * Icon options
   */
  icon?: IconMarkerOptions;
}

export interface IconMarkerOptions {
  /**
   * Path to the icon image
   */
  src?: string;
  /**
   * Scale value for marker
   */
  scale?: number;
}
