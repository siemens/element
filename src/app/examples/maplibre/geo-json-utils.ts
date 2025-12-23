/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { MapPoint } from '@siemens/maps-ng';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const buildGeoJSON = (points: MapPoint[]): GeoJSON.GeoJSON => {
  const features = [];
  for (const point of points) {
    const props: Record<string, any> = {};
    // Copy all properties except functions
    for (const propKey in point) {
      if (typeof point[propKey as keyof MapPoint] !== 'function') {
        props[propKey] = point[propKey as keyof MapPoint];
      }
    }

    // Create new feature
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lon, point.lat]
      },
      properties: {
        ...props,
        group: point.group ?? 0
      }
    } as GeoJSON.Feature;
    features.push(feature);
  }

  return { type: 'FeatureCollection', features };
};

export const getData = async (): Promise<FeatureCollection<Geometry, GeoJsonProperties>> => {
  const response = await fetch('./assets/floor.geojson');
  return response.json();
};
