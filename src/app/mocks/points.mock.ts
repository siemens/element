/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { MapPoint } from '@siemens/maps-ng';

/* eslint-disable no-console */

const mockGeneratedPoints: MapPoint[] = [...Array(3500)].map((_, i) => ({
  lat: i % 2 === 0 ? 43.7 : 43.1,
  lon: i % 2 === 0 ? 9 : 8.4920847,
  name: `Point ${i}`,
  description: `Point ${i} description`,
  group: i % 2 === 0 ? (i % 3 === 0 ? 1 : 2) : i % 3 === 0 ? 2 : 3
}));

export const mockGroupedPoints: MapPoint[] = [
  ...mockGeneratedPoints,
  {
    lat: 45.4375,
    lon: 12.3358,
    name: 'Point 1',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4355,
    lon: 12.3321,
    name: 'Point 1H',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4375,
    lon: 12.3358,
    name: 'Point 1G',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4371,
    lon: 12.3398,
    name: 'Point 1F TEST TEST',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4395,
    lon: 12.3358,
    name: 'Point 1E  TEST TEST',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4355,
    lon: 12.3328,
    name: 'Point 1D  TEST TEST Thisisareallylongword',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4371,
    lon: 12.335,
    name: 'Point 1C TEST TEST',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4365,
    lon: 12.3338,
    name: 'Point 1B',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4371,
    lon: 12.3356,
    name: 'Point 1A',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 44.4375,
    lon: 13.3358,
    name: 'Point 2',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 43.4375,
    lon: 13.8358,
    name: 'Point 3',
    description: 'Group 2 - Icon Marker',
    marker: {
      type: 'icon'
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 2
  },
  {
    lat: 43.4375,
    lon: 13.4358,
    name: 'Point 4',
    description: 'Group 3 - Custom icon',
    marker: {
      type: 'icon',
      icon: {
        src: 'assets/home.svg',
        scale: 1.5
      }
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 3
  },
  {
    lat: 43.4375,
    lon: 15.0358,
    name: 'Point 5',
    description: 'Group 1',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 45.4375,
    lon: 14.3358,
    name: 'Point 6',
    description: 'Group 2',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 2
  },
  {
    lat: 12.5,
    lon: 41.9,
    name: 'Point 7',
    description: '<h2>Group 3</h2>',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 3
  },
  {
    lat: 15.5,
    lon: 41.9,
    name: 'Point 8',
    description: 'Default icon marker <br><br>Group 3',
    marker: {
      type: 'icon'
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 3
  },
  {
    lat: 16.5,
    lon: 41.9,
    name: 'Point 9',
    description: 'Custom icon asset <br><br>Group 1',
    marker: {
      type: 'icon',
      icon: {
        src: 'assets/home.svg',
        scale: 1
      }
    },
    click: extraProperties => alert(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  },
  {
    lat: 17.5,
    lon: 41.9,
    name: 'Point 10',
    description: 'Description <a href="#">Group 1</a>',
    click: extraProperties => alert(JSON.stringify(extraProperties)),
    extraProperties: {},
    group: 1
  }
];

export const mockUngroupedPoints: MapPoint[] = [
  {
    lat: 48.09245674627152,
    lon: 11.651379362240352,
    name: 'Siemens',
    description: 'Default marker style',
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {}
  },
  {
    lat: 48.09245674627152,
    lon: 13.651379362240352,
    name: 'Bosch',
    description: 'Default marker with custom color',
    marker: {
      type: 'status',
      status: 'caution'
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {}
  },
  {
    lat: 48.09245674627152,
    lon: 15.651379362240352,
    name: 'Tatalama',
    description: 'Default icon marker',
    marker: {
      type: 'status',
      status: 'danger'
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {}
  },
  {
    lat: 48.09245674627152,
    lon: 17.651379362240352,
    name: 'Building Passadena',
    description: 'Default icon marker',
    marker: {
      type: 'status',
      status: 'success'
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {}
  },
  {
    lat: 48.09245674627152,
    lon: 19.651379362240352,
    name: 'Rockabill',
    description: 'Customized icon marker',
    marker: {
      type: 'icon',
      icon: {
        src: 'assets/home.svg',
        scale: 0.75
      }
    },
    click: extraProperties => console.log(JSON.stringify(extraProperties)),
    extraProperties: {}
  }
];

export const singlePoint: MapPoint = {
  lat: 46.4375,
  lon: 18.3358,
  name: 'Single Point',
  description: '<h2>zoomed in and showing popup with HTML description</h2>',
  click: extraProperties => console.log(JSON.stringify(extraProperties)),
  marker: {
    type: 'status',
    status: 'unknown'
  },
  extraProperties: {
    label: 'This is extra prop',
    value: 123
  },
  group: 4
};

export const mockPoints: MapPoint[] = [...mockGroupedPoints, ...mockUngroupedPoints, singlePoint];
