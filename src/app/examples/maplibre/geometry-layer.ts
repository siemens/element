/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { GeoJSONSourceComponent, LayerComponent } from '@maplibre/ngx-maplibre-gl';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { FilterSpecification } from 'maplibre-gl';

type Config = {
  type: 'line' | 'fill';
  id: string;
  before?: string;
  shape: string;
  color: string;
  opacity: number;
};

@Component({
  selector: 'app-geometry-layer',
  imports: [GeoJSONSourceComponent, LayerComponent],
  template: `
    @if (data()) {
      <mgl-geojson-source [id]="sourceId" [data]="data()!" />
      @for (entry of config; track $index) {
        <mgl-layer
          [type]="entry.type"
          [id]="entry.id"
          [before]=""
          [source]="sourceId"
          [filter]="getFilter(entry.shape)"
          [paint]="{
            'fill-color': entry.color,
            'fill-opacity': entry.opacity,
            'fill-outline-color': '#000000'
          }"
        />
      }
    }
  `
})
export class GeometryLayerComponent {
  private static idCounter = 0;

  readonly data = input<string | FeatureCollection<Geometry, GeoJsonProperties>>();

  protected sourceId = `geometry-layer-${GeometryLayerComponent.idCounter++}`;
  protected config: Config[] = [
    {
      type: 'fill',
      id: `${this.sourceId}-systems`,
      shape: 'systems',
      color: '#b55cb8',
      opacity: 1
    },
    {
      type: 'fill',
      id: `${this.sourceId}-desks`,
      shape: 'desks',
      color: '#1d110a',
      opacity: 1
    },
    {
      type: 'fill',
      id: `${this.sourceId}-devices`,
      shape: 'devices',
      color: '#f17019',
      opacity: 1
    },
    {
      type: 'fill',
      id: `${this.sourceId}-spaces`,
      shape: 'spaces',
      color: '#f1d4b3',
      opacity: 0.8
    },
    {
      type: 'fill',
      id: `${this.sourceId}-datapoints`,
      shape: 'datapoints',
      color: '#e7955f',
      opacity: 1
    },
    {
      type: 'fill',
      id: `${this.sourceId}-segments`,
      shape: 'segments',
      color: '#f5d7b0',
      opacity: 1
    },
    {
      type: 'fill',
      id: `${this.sourceId}-spatial`,
      shape: 'spatial',
      color: '#f5cc98',
      opacity: 1
    },
    {
      shape: 'default',
      id: `${this.sourceId}-default`,
      type: 'fill',
      color: '#405be2',
      opacity: 1
    }
  ];

  protected getFilter(shape: string): FilterSpecification {
    if (shape !== 'default') {
      return ['all', ['==', '$type', 'Polygon'], ['==', 'shapeType', shape]];
    } else {
      return [
        'all',
        ['==', '$type', 'Polygon'],
        [
          '!in',
          'shapeType',
          'desks',
          'devices',
          'spaces',
          'datapoints',
          'segments',
          'spatial',
          'systems'
        ]
      ];
    }
  }
}
