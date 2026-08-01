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
  PopupComponent,
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

type StatusPoint = GeoJSON.Feature<
  GeoJSON.Point,
  { name: string; description: string; type: 'status'; status: MarkerStatus }
>;

const statusPoints = (
  [
    'default',
    'unknown',
    'success',
    'info',
    'warning',
    'danger',
    'caution',
    'critical'
  ] as MarkerStatus[]
).map((status, index) => {
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  const radius = index * 0.014;
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [11.54774 + radius * Math.cos(angle), 48.138848 + radius * Math.sin(angle)]
    },
    properties: {
      name: `marker point (${status})`,
      description: `Description for marker point ${status}`,
      type: 'status',
      status
    }
  } as StatusPoint;
});

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
    PopupComponent,
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
  protected readonly points = signal<StatusPoint[]>(statusPoints);

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
