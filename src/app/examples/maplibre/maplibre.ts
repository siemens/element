/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AttributionControlDirective,
  ControlComponent,
  EventData,
  FullscreenControlDirective,
  GeolocateControlDirective,
  GlobeControlDirective,
  MapComponent,
  NavigationControlDirective,
  Position,
  ScaleControlDirective
} from '@maplibre/ngx-maplibre-gl';
import { injectSiMapStyle } from '@siemens/element-ng/maplibre';
import { LOG_EVENT } from '@siemens/live-preview';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ControlComponent,
    FullscreenControlDirective,
    GeolocateControlDirective,
    GlobeControlDirective,
    MapComponent,
    NavigationControlDirective,
    ScaleControlDirective
  ],
  templateUrl: './maplibre.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = injectSiMapStyle(environment.maptilerKey);

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
