/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';

describe('Service: Map', () => {
  let mapService: MapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MapService]
    }).compileComponents();
    mapService = TestBed.inject(MapService);
  });

  it('should create the service', () => {
    expect(mapService).toBeTruthy();
  });

  it('should create feature from one point with necessary options', () => {
    const feature = mapService.createFeatures([
      {
        lat: 46.4375,
        lon: 18.3358,
        name: 'name3',
        description: '<h1>Rockabill View</h1>' + '<br>' + '<h2>Learn More</h2>',
        marker: {
          type: 'dot',
          color: 'red'
        },
        click: extraProperties => {
          alert(JSON.stringify(extraProperties));
        },
        extraProperties: {},
        group: 3
      }
    ]);
    const feat = feature[0];
    expect(feat.getGeometry()).toBeDefined();
    expect(feat.get('name')).toBeDefined();
    expect(feat.get('description')).toBeDefined();
    expect(feat.get('marker')).toBeDefined();
    expect(feat.get('group')).toBeDefined();
    expect(feat.get('click')).toBeDefined();
  });

  it('cluster layer should be initialized', () => {
    const feature = mapService.createFeatures([
      {
        lat: 50.4375,
        lon: 10.3358,
        name: 'name11',
        description: 'description text 1',
        click: extraProperties => {
          alert(JSON.stringify(extraProperties));
        },
        extraProperties: {},
        group: 1
      },
      {
        lat: 55.4375,
        lon: 15.3358,
        name: 'name22',
        description: 'description text 1',
        click: extraProperties => {
          alert(JSON.stringify(extraProperties));
        },
        extraProperties: {},
        group: 1
      },
      {
        lat: 46.4375,
        lon: 18.3358,
        name: 'name3',
        description: '<h1>Rockabill View</h1>' + '<br>' + '<h2>Learn More</h2>',
        click: extraProperties => {
          alert(JSON.stringify(extraProperties));
        },
        extraProperties: {},
        group: 3
      }
    ]);
    const clusterLayer = mapService.clusterLayer(feature, true, 40, true);
    expect(clusterLayer).toBeDefined();
    expect(clusterLayer.getSource).toBeDefined();
    expect(clusterLayer.getSource()).toBeDefined();
  });

  it('vector layer should be initialized', () => {
    const feature = mapService.createFeatures([
      {
        lat: 46.4375,
        lon: 18.3358,
        name: 'name3',
        description: '<h1>Rockabill View</h1>' + '<br>' + '<h2>Learn More</h2>',
        click: extraProperties => {
          alert(JSON.stringify(extraProperties));
        },
        extraProperties: {},
        group: 3
      }
    ]);
    mapService.setTheme(undefined);
    const vectorLayer = mapService.vectorLayer(feature, true);
    expect(vectorLayer).toBeDefined();
    expect(vectorLayer.get('source')).toBeDefined();
  });
});
