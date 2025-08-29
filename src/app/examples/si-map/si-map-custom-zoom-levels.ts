/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import { MapPoint, OverlayNativeProperties, SiMapComponent } from '@siemens/maps-ng';
import { FullScreen } from 'ol/control';
import { mockPoints } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-custom-zoom-levels.html',
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  readonly map = viewChild.required(SiMapComponent);

  points: MapPoint[] = mockPoints;
  maptilerKey = environment.maptilerKey;
  styleJson = environment.maptilerUrl;

  selectZoomLevel = 5;
  clickCusterZoomLevel = 15;
  clickFeatureZoomLevel = 20;
  nativeProperties: OverlayNativeProperties = {
    controls: [
      new FullScreen({
        label: '',
        labelActive: '',
        tipLabel: 'Toggle full screen',
        inactiveClassName: 'element-zoom',
        activeClassName: 'element-pinch'
      })
    ]
  };

  refresh(): void {
    this.map().refresh(mockPoints);
  }

  select(): void {
    this.map().select(mockPoints[10]);
  }

  clear(): void {
    this.map().clear();
  }
}
