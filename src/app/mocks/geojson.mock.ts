/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export const mockGeoJson: GeoJSON.FeatureCollection<GeoJSON.Polygon, GeoJSON.GeoJsonProperties> = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-71.033038671, 42.212508657],
            [-71.033112468, 42.212508657],
            [-71.033186265, 42.212508657],
            [-71.033186265, 42.212479961],
            [-71.033150575, 42.212479961],
            [-71.033150575, 42.212495434],
            [-71.03314679, 42.212495434],
            [-71.03314679, 42.212477147],
            [-71.033186265, 42.212477147],
            [-71.033186264, 42.212448451],
            [-71.033038671, 42.212448451],
            [-71.033038671, 42.212508657]
          ]
        ]
      },
      'properties': {
        'shapeId': '47bc1276-0bc0-4cee-92d6-d15234fa0dfe',
        'kdbId': '3104c4b7-218c-4ef6-b337-db73b5b57715',
        'sourceId': '3NFW5diVv96hhwb7sInXEZ',
        'buildingId': 'c5727ea8-ccf5-43b7-9456-daef07920b1b',
        'floorId': '8d50308d-1791-433f-b008-13ae3ba2c3c9',
        'description': null,
        'area': 8.716382061142403e-9,
        'shapeType': 'spaces'
      }
    }
  ]
};
