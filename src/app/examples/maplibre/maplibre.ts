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
import type { MapLibreEvent } from 'maplibre-gl';

import { environment } from '../../../environments/environment';

type StatusPoint = GeoJSON.Feature<
  GeoJSON.Point,
  { name: string; description: string; type: 'status'; status: MarkerStatus }
>;

const buildPoint = (coordinates: number[], status: MarkerStatus): StatusPoint => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates
  },
  properties: {
    name: 'marker point',
    description: `Description for marker point`,
    type: 'status',
    status
  }
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
  styleUrl: './maplibre.scss',
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);
  protected readonly mapTranslations = injectSiMapTranslations();
  protected readonly points = signal<StatusPoint[]>([
    buildPoint([11.34774, 48.138848], 'default'),
    buildPoint([11.24774, 48.258848], 'unknown'),
    buildPoint([11.18037, 48.258848], 'success'),
    buildPoint([11.54774, 48.158848], 'info'),
    buildPoint([11.51274, 48.178848], 'warning'),
    buildPoint([11.54774, 48.178848], 'danger'),
    buildPoint([11.37774, 48.288848], 'caution'),
    buildPoint([11.52774, 48.280848], 'critical')
  ]);
  protected readonly selectedPoint = signal<StatusPoint | undefined>(undefined);

  private popupTrigger: HTMLButtonElement | undefined;

  protected togglePopup(point: StatusPoint, trigger: HTMLButtonElement, event: MouseEvent): void {
    event.stopPropagation();

    if (this.selectedPoint() === point) {
      this.closePopup();
      return;
    }

    this.popupTrigger = trigger;
    this.selectedPoint.set(point);
  }

  protected closePopup(event?: Event): void {
    event?.stopPropagation();

    const trigger = this.popupTrigger;
    this.popupTrigger = undefined;
    this.selectedPoint.set(undefined);

    queueMicrotask(() => trigger?.focus());
  }

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

  protected onResize(event: MapLibreEvent): void {
    const canvas = event.target.getCanvas();
    this.logEvent('resize', { width: canvas.clientWidth, height: canvas.clientHeight });
  }
}
