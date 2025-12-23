/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AttributionControlDirective,
  ControlComponent,
  EventData,
  MapComponent,
  NavigationControlDirective
} from '@maplibre/ngx-maplibre-gl';
import { observeStyleJson, observeTranslations } from '@siemens/element-ng/maplibre';
import { LOG_EVENT } from '@siemens/live-preview';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';

import { getData } from './geo-json-utils';
import { GeometryLayerComponent } from './geometry-layer';

@Component({
  selector: 'app-sample',
  imports: [
    AttributionControlDirective,
    ControlComponent,
    MapComponent,
    NavigationControlDirective,
    GeometryLayerComponent
  ],
  templateUrl: './map-geojson.html',
  styleUrl: './map-cluster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-100 d-flex flex-column p-5'
  }
})
export class SampleComponent {
  protected readonly map = viewChild.required(MapComponent);
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly style = observeStyleJson(environment.maptilerKey);
  protected readonly translations = observeTranslations();
  protected readonly geoJsonBuilding = toSignal(from(getData()));

  refresh(): void {}

  select(): void {}

  clear(): void {}

  protected onError(event: ErrorEvent & EventData): void {
    if (event.error.message) {
      this.logEvent('map error', event.error.message);
    } else {
      this.logEvent('map error', event.error);
    }
  }

  toString(value: any): string {
    return JSON.stringify(value.properties, null, 2);
  }
}
