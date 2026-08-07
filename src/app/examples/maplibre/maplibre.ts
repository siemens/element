/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import {
  AttributionControlDirective,
  ControlComponent,
  EventData,
  FullscreenControlDirective,
  GeolocateControlDirective,
  GlobeControlDirective,
  MapComponent,
  MarkerComponent,
  NavigationControlDirective,
  Position,
  ScaleControlDirective
} from '@maplibre/ngx-maplibre-gl';
import {
  injectSiMapStyle,
  injectSiMapTranslations,
  MarkerStatus,
  SiStatusMarkerComponent
} from '@siemens/element-ng/maplibre';
import { LOG_EVENT } from '@siemens/live-preview';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ControlComponent,
    FullscreenControlDirective,
    GeolocateControlDirective,
    GlobeControlDirective,
    MapComponent,
    MarkerComponent,
    NavigationControlDirective,
    ScaleControlDirective,
    SiStatusMarkerComponent
  ],
  templateUrl: './maplibre.html',
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);
  protected readonly mapTranslations = injectSiMapTranslations();
  protected readonly points = signal<
    GeoJSON.Feature<
      GeoJSON.Point,
      { name: string; description: string; type: 'status'; status: MarkerStatus }
    >[]
  >([
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [11.54774, 48.138848]
      },
      properties: {
        name: 'Critical Point',
        description: 'Zoomed in and showing popup with HTML description',
        type: 'status',
        status: 'critical'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [11.57774, 48.158848]
      },
      properties: {
        name: 'Success Point',
        description: 'Zoomed in and showing popup with HTML description',
        type: 'status',
        status: 'success'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [11.53774, 48.168848]
      },
      properties: {
        name: 'Danger Point',
        description: 'Zoomed in and showing popup with HTML description',
        type: 'status',
        status: 'danger'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [11.58774, 48.132848]
      },
      properties: {
        name: 'Caution Point',
        description: 'Zoomed in and showing popup with HTML description',
        type: 'status',
        status: 'caution'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [11.53774, 48.232848]
      },
      properties: {
        name: 'Unknown Point',
        description: 'Zoomed in and showing popup with HTML description',
        type: 'status',
        status: 'unknown'
      }
    }
  ]);

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
