/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, input, OnInit, viewChild } from '@angular/core';
import { MapPoint, MapPointMetaData, SiMapComponent } from '@siemens/maps-ng';
import { FeatureLike } from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';
import { shapes } from 'src/app/mocks/custom-shape-style';
import { mockGeoJson } from 'src/app/mocks/geojson.mock';
import { environment } from 'src/environments/environment';

interface MapPointCustom extends MapPointMetaData {
  floorId: string;
  shapeType: string;
}

@Component({
  selector: 'app-floor-popover',
  template: `
    <table>
      <thead>
        <th>Floor Id</th>
        <th>Shape Type</th>
      </thead>
      <tr>
        <td>{{ mapPoint().floorId }}</td>
        <td>{{ mapPoint().shapeType }}</td>
      </tr>
    </table>
  `
})
export class CustomPopoverComponent {
  readonly mapPoint = input.required<MapPointCustom>();
}

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-geo-json.html',
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent implements OnInit, AfterViewInit {
  readonly siMapInstance = viewChild.required(SiMapComponent);

  points: MapPoint[] = [];
  maptilerKey = environment.maptilerKey;
  styleJson = environment.maptilerUrl;
  popoverComponent = CustomPopoverComponent;

  geoJson = {};
  styleFunction: StyleFunction = (feature: FeatureLike, resolution: number): Style => {
    const styles = shapes[feature.get('shapeType') ?? 'default'];
    return new Style({
      stroke: new Stroke({
        color: styles.strokecolor,
        width: styles.strokewidth
      }),
      fill: new Fill({
        color: styles.fillcolor
      }),
      zIndex: styles.zindex
    });
  };

  /**
   * Center coordinates for geoJson
   */
  centerCoordinates: number[] = [-71.0331121579887, 42.2124892838472];

  /**
   * zoom level for focusing geoJson
   */
  geoJsonZoom = 19;

  ngOnInit(): void {
    this.fetchJSON('./assets/floor.geojson').then((response: any) => (this.geoJson = response));
  }

  fetchJSON(url: string): Promise<any> {
    return fetch(url).then(response => response.json());
  }

  ngAfterViewInit(): void {
    this.siMapInstance()
      .map?.getView()
      .animate({
        zoom: this.geoJsonZoom,
        center: fromLonLat(this.centerCoordinates)
      });
  }

  changeGeoJson(): void {
    if (this.geoJson === mockGeoJson) {
      this.fetchJSON('./assets/floor.geojson').then((response: any) => (this.geoJson = response));
    } else {
      this.geoJson = mockGeoJson;
    }
  }
}
