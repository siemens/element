/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject } from '@angular/core';
import {
  AttributionControlDirective,
  ControlComponent,
  EventData,
  FullscreenControlDirective,
  GeolocateControlDirective,
  GlobeControlDirective,
  LayerComponent,
  MapComponent,
  NavigationControlDirective,
  Position,
  ScaleControlDirective
} from '@maplibre/ngx-maplibre-gl';
import { injectSiMapStyle, injectSiMapTranslations } from '@siemens/element-ng/maplibre';
import { injectIsDarkTheme } from '@siemens/element-ng/theme';
import { LOG_EVENT } from '@siemens/live-preview';
import type {
  ExpressionSpecification,
  FillExtrusionLayerSpecification,
  FilterSpecification
} from 'maplibre-gl';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ControlComponent,
    FullscreenControlDirective,
    GeolocateControlDirective,
    GlobeControlDirective,
    LayerComponent,
    MapComponent,
    NavigationControlDirective,
    ScaleControlDirective
  ],
  templateUrl: './maplibre-3d-buildings.html',
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);
  protected readonly mapTranslations = injectSiMapTranslations();
  private readonly isDark = injectIsDarkTheme();

  protected readonly buildingFilter = [
    '!=',
    ['get', 'hide_3d'],
    true
  ] as unknown as FilterSpecification;

  protected readonly buildingPaint = computed<FillExtrusionLayerSpecification['paint']>(() => ({
    'fill-extrusion-color': this.isDark() ? 'rgba(7, 72, 89, 1)' : 'rgba(164, 146, 127, 1)',
    'fill-extrusion-opacity': 0.85,
    // Animate height from 0 to render_height between zoom 15 and 16.
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      16,
      ['get', 'render_height']
    ] as ExpressionSpecification,
    'fill-extrusion-base': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      16,
      ['get', 'render_min_height']
    ] as ExpressionSpecification
  }));

  protected onError(event: ErrorEvent & EventData): void {
    if (event.error.message) {
      this.logEvent('map error', event.error.message);
    } else {
      this.logEvent('map error', event.error);
    }
  }

  protected onGeolocate(position: Position): void {
    this.logEvent('geolocate', position);
  }
}
