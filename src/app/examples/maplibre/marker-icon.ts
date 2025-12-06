/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { MarkerOptions } from "@siemens/maps-ng";
import { GeoJsonProperties } from "geojson";
import { themeElement } from "projects/maps-ng/src/components/si-map/shared/themes/element";
import { getMarker } from "projects/maps-ng/src/components/si-map/shared/themes/marker";

@Component({
  selector: 'app-marker-icon',
  template: `@switch (marker().type) {
    @case ('icon') {
      @if (backgroundImg()) {
        <div class="custom-marker-icon" [style.inline-size.px]="32" [style.block-size.px]="32" [style.background-color]="iconColor()" [style.mask-image]="backgroundImg()"></div>
      }
    }
    @default {
      <div
        class="custom-marker-icon"
        [innerHTML]="statusSvg()"
      ></div>
    }
  }`
})
export class MarkerIconComponent {
  protected readonly domSanitizer = inject(DomSanitizer);
  protected readonly style = themeElement.style();

  readonly props = input<GeoJsonProperties>();
  readonly group = input<number>();
  readonly groupColors = input<Record<number, string>>();

  protected readonly marker = computed(() => {
    const json = this.props()?.marker;
    return (json ? JSON.parse(json) : { type: 'icon' }) as MarkerOptions;
  });

  protected readonly iconColor = computed(() => {
    const group = this.group();
    if (group != undefined) {
      return this.groupColors()?.[group] ?? this.style.defaultMarkerColor;
    }
    return this.marker()?.color ?? this.style.defaultMarkerColor;

  });
  protected readonly backgroundImg = computed(() => {
    if (this.marker().status) {
      return null;
    }
    const src = this.marker().icon?.src ?? 'assets/default-marker-icon.svg';
    return this.domSanitizer.bypassSecurityTrustUrl(`url(${src})`);
  })

  protected readonly statusSvg = computed(() => {
    const marker = this.marker();
    if (!marker.status) {
      return null;
    }
    return this.domSanitizer.bypassSecurityTrustHtml(getMarker(marker.status ?? 'default', this.style));
  });
}
