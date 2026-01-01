/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

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

export interface MapColorPalette {
  fillColor: string;
  strokeColor: string;
  textColor: string;
  defaultMarkerColor: string;
  status: Record<string, string>;
  colorPalette: {
    status: string[];
    element: string[];
  };
}
