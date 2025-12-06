/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlComponent,
  EventData,
  MapComponent,
  NavigationControlDirective
} from '@maplibre/ngx-maplibre-gl';
import { LOG_EVENT } from '@siemens/live-preview';
import { themeElement } from '@siemens/maps-ng/src/components/si-map/shared';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';

import { GeometryLayerComponent } from './geometry-layer';
import { styleJson } from './map-style';

const getData = async (): Promise<FeatureCollection<Geometry, GeoJsonProperties>> => {
  const response = await fetch('./assets/floor.geojson');
  return response.json();
};

@Component({
  selector: 'app-sample',
  imports: [ControlComponent, MapComponent, NavigationControlDirective, GeometryLayerComponent],
  templateUrl: './map-geojson.html',
  styleUrl: './map-cluster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-100 d-flex flex-column p-5',
    '(window:theme-switch)': 'changeTheme($event)'
  }
})
export class SampleComponent {
  protected readonly map = viewChild.required(MapComponent);
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly mapStyle = signal(styleJson(environment.maptilerKey));
  protected readonly style = themeElement.style();
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

  protected changeTheme(event: Event): void {
    this.mapStyle.set(styleJson(environment.maptilerKey, (event as CustomEvent).detail.dark));
  }

  toString(value: any): string {
    return JSON.stringify(value.properties, null, 2);
  }
}
