/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GeoJsonProperties } from 'geojson';

import { MarkerOptions } from './model';
import { mapColorPalette } from './si-maplibre-style';

/**
 * Component to render a marker icon for maplibre markers. The marker can be either a custom icon or a status icon.
 * The status icon is rendered as an SVG using a sprite sheet.
 * The sprite can be provided by adding the following lines to your angular.json assets section:
 * ```
 * {
 *   ...
 *   "assets": [
 *        ...
 *       {
 *         "glob": "*",
 *         "input": "projects/element-ng/assets/map",
 *         "output": "assets/map"
 *       },
 *       ...
 *    ]
 *  ...
 * }
 * ```
 */
@Component({
  selector: 'si-marker-icon',
  template: `@switch (marker().type) {
    @case ('icon') {
      @if (backgroundImg()) {
        <div
          class="custom-marker-icon"
          style="mask-position: center; mask-repeat: no-repeat;"
          [style.inline-size.px]="size()"
          [style.block-size.px]="size()"
          [style.background-color]="iconColor()"
          [style.mask-image]="backgroundImg()"
        ></div>
      }
    }
    @default {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        [attr.width]="size()"
        [attr.height]="size()"
        [attr.data-status]="marker().status"
        [style.--marker-fill]="palette().fillColor"
        [style.--marker-text]="palette().textColor"
        [style.--marker-icon]="markerIconColor()"
      >
        <use [attr.href]="statusSvg()" />
      </svg>
    }
  }`,
  host: {
    '[attr.status]': 'marker().status ?? undefined'
  }
})
export class SiMarkerIconComponent {
  protected readonly domSanitizer = inject(DomSanitizer);
  protected readonly palette = mapColorPalette();
  /**
   * Size of the marker icon in pixels.
   * @defaultValue 64
   */
  readonly size = input<number>(64);
  /**
   * Properties of the GeoJSON feature.
   */
  readonly props = input<GeoJsonProperties>();
  /**
   * Group number of the marker.
   */
  readonly group = input<number>();
  /**
   * Colors for each group number e.g.: `{ 1: '#ff0000', 2: '#00ff00' }`.
   * If the group number is set and exists in the map, the corresponding color will be used as the marker color.
   */
  readonly groupColors = input<Record<number, string>>();

  protected readonly marker = computed(() => {
    const json = this.props()?.marker;
    return (json ? JSON.parse(json) : { type: 'icon' }) as MarkerOptions;
  });

  protected readonly markerIconColor = computed(() => {
    const marker = this.marker();
    const palette = this.palette();
    const status = marker.status;
    if (status && status !== 'default') {
      return palette.status[status] || palette.status.success;
    }
    return palette.status.success;
  });

  protected readonly iconColor = computed(() => {
    const group = this.group();
    if (group != undefined) {
      return this.groupColors()?.[group] ?? this.palette().defaultMarkerColor;
    }
    return this.marker()?.color ?? this.palette().defaultMarkerColor;
  });

  protected readonly backgroundImg = computed(() => {
    if (this.marker().status) {
      return null;
    }
    const src = this.marker().icon?.src ?? 'assets/default-marker-icon.svg';
    return this.domSanitizer.bypassSecurityTrustUrl(`url(${src})`);
  });

  protected readonly statusSvg = computed(() => {
    const marker = this.marker();
    if (!marker.status) {
      return null;
    }
    return `assets/map/marker-spite.svg#marker-${marker.status ?? 'default'}`;
  });
}
