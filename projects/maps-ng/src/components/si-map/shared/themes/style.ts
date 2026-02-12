/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

// Fonts
// TODO: This is a workaround to disable loading of google fonts.
const italicFonts = ['SiemensSans Pro', 'sans-serif'];
const regularFonts = ['SiemensSans Pro', 'sans-serif'];
const boldFonts = ['SiemensSans Pro', 'sans-serif'];

// Colors
const deepBlue900 = 'rgba(32, 33, 50, 1)';
const green700 = (opacity: number): string => `rgba(28, 112, 63, ${opacity})`;
const green500 = (opacity: number): string => `rgba(40, 191, 102, ${opacity})`;
const green300 = (opacity: number): string => `rgba(114, 230, 163, ${opacity})`;
const blue700 = 'rgb(30, 82, 153)';
const blue100 = 'rgb(210, 226, 247)';

export const styleJson = (key: string, dark?: boolean): any => ({
  'version': 8,
  'name': 'siemens-brand',
  'sources': {
    'attribution': {
      'attribution': '<a href="https://carto.com/" target="_blank">&copy; CARTO</a>',
      'type': 'vector'
    },
    'openmaptiles': {
      'url': `https://api.maptiler.com/tiles/v3/tiles.json?key=${key}`,
      'type': 'vector'
    },
    'maptiler_attribution': {
      'attribution':
        '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      'type': 'vector'
    }
  },
  'layers': [
    {
      'id': 'background',
      'type': 'background',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'background-color': dark ? deepBlue900 : 'rgb(247, 247, 246)',
        'background-opacity': 1
      }
    },
    {
      'id': 'landcover',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'landcover',
      'paint': {
        'fill-color': {
          'stops': [
            [8, dark ? green500(0.15) : green300(0.15)],
            [9, dark ? green500(0.15) : green300(0.2)],
            [11, dark ? green500(0.2) : green300(0.3)],
            [13, dark ? green500(0.1) : green300(0.35)],
            [15, dark ? green500(0.15) : green300(0.5)]
          ]
        },
        'fill-opacity': 1
      },
      'filter': [
        'any',
        ['==', 'class', 'wood'],
        ['==', 'class', 'grass'],
        ['==', 'subclass', 'recreation_ground']
      ]
    },
    {
      'id': 'park_national_park',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'park',
      'minzoom': 6,
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': {
          'stops': [
            [8, dark ? green700(0.2) : green300(0.2)],
            [9, dark ? green700(0.25) : green300(0.25)],
            [11, dark ? green700(0.35) : green300(0.35)],
            [13, dark ? green700(0.4) : green300(0.4)],
            [15, dark ? green700(0.6) : green300(0.6)]
          ]
        },
        'fill-opacity': 1,
        'fill-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'national_park']]
    },
    {
      'id': 'park_nature_reserve',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'park',
      'minzoom': 0,
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': {
          'stops': [
            [8, dark ? green700(0.2) : green300(0.2)],
            [9, dark ? green700(0.25) : green300(0.25)],
            [11, dark ? green700(0.35) : green300(0.35)],
            [13, dark ? green700(0.4) : green300(0.4)],
            [15, dark ? green700(0.6) : green300(0.6)]
          ]
        },
        'fill-opacity': {
          'stops': [
            [6, 0.7],
            [9, 0.9]
          ]
        },
        'fill-antialias': true
      },
      'filter': ['all', ['==', 'class', 'nature_reserve']]
    },
    {
      'id': 'landuse_residential',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'landuse',
      'minzoom': 6,
      'paint': {
        'fill-color': {
          'stops': [
            [5, dark ? 'rgba(27, 28, 29, 0.5)' : 'rgba(222, 226, 232, 0.5)'],
            [8, dark ? 'rgba(27, 28, 29, 0.45)' : 'rgba(222, 226, 232, 0.45)'],
            [9, dark ? 'rgba(27, 28, 29, 0.4)' : 'rgba(222, 226, 232, 0.4)'],
            [11, dark ? 'rgba(27, 28, 29, 0.35)' : 'rgba(222, 226, 232, 0.35)'],
            [13, dark ? 'rgba(27, 28, 29, 0.3)' : 'rgba(222, 226, 232, 0.3)'],
            [15, dark ? 'rgba(27, 28, 29, 0.25)' : 'rgba(222, 226, 232, 0.25)'],
            [16, dark ? 'rgba(27, 28, 29, 0.15)' : 'rgba(222, 226, 232, 0.15)']
          ]
        },
        'fill-opacity': {
          'stops': [
            [6, 0.6],
            [9, 1]
          ]
        }
      },
      'filter': ['any', ['==', 'class', 'residential']]
    },
    {
      'id': 'landuse',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'landuse',
      'paint': {
        'fill-color': {
          'stops': [
            [8, dark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(195, 189, 205, 0.2)'],
            [9, dark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(195, 189, 205, 0.25)'],
            [11, dark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(195, 189, 205, 0.35)'],
            [13, dark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(195, 189, 205, 0.4)'],
            [15, dark ? 'rgb(20, 20, 20)' : 'rgb(218, 216, 222)']
          ]
        }
      },
      'filter': ['any', ['==', 'class', 'cemetery'], ['==', 'class', 'stadium']]
    },
    {
      'id': 'waterway',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'waterway',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? blue700 : blue100,
        'line-width': {
          'stops': [
            [8, 0.5],
            [9, 1],
            [15, 2],
            [16, 3]
          ]
        }
      }
    },
    {
      'id': 'boundary_county',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'boundary',
      'minzoom': 9,
      'maxzoom': 24,
      'paint': {
        'line-color': {
          'stops': [
            [4, dark ? 'rgba(110, 110, 110, 1)' : 'rgba(145, 145, 145, 0.6)'],
            [5, dark ? 'rgba(112, 112, 112, 1)' : 'rgba(145, 145, 145, 0.8)'],
            [6, dark ? 'rgba(189, 189, 189, 1)' : 'rgba(145, 145, 145, 0.9)']
          ]
        },
        'line-width': {
          'stops': [
            [4, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'admin_level', 6], ['==', 'maritime', 0], ['==', 'disputed', 0]]
    },
    {
      'id': 'boundary_state',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'boundary',
      'minzoom': 4,
      'paint': {
        'line-color': {
          'stops': [
            [4, dark ? 'rgba(68, 73, 76, 1)' : '#d4d5d6'],
            [5, dark ? 'rgba(68, 73, 76, 1)' : '#d4d5d6'],
            [6, dark ? '#656A6E' : '#e1c5c7']
          ]
        },
        'line-width': {
          'stops': [
            [4, 0.5],
            [7, 1],
            [8, 1],
            [9, 1.2]
          ]
        }
      },
      'filter': ['all', ['==', 'admin_level', 4], ['==', 'maritime', 0], ['==', 'disputed', 0]]
    },
    {
      'id': 'water',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'water',
      'minzoom': 0,
      'maxzoom': 24,
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgb(175, 201, 241)',
        'fill-opacity': 1,
        'fill-antialias': true,
        'fill-translate-anchor': 'map'
      },
      'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'brunnel', 'tunnel']]
    },
    {
      'id': 'water_shadow',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'water',
      'minzoom': 0,
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': dark ? 'rgba(74, 84, 113, 1)' : 'rgb(210, 226, 247)',
        'fill-opacity': 1,
        'fill-antialias': true,
        'fill-translate': {
          'stops': [
            [0, [0, 2]],
            [6, [0, 1]],
            [14, [0, 1]],
            [17, [0, 2]]
          ]
        },
        'fill-translate-anchor': 'map'
      },
      'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'brunnel', 'tunnel']]
    },
    {
      'id': 'aeroway-runway',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'aeroway',
      'minzoom': 12,
      'layout': {
        'line-cap': 'square'
      },
      'paint': {
        'line-color': dark ? 'rgb(97, 97, 97)' : 'rgb(227, 226, 226)',
        'line-width': {
          'stops': [
            [11, 1],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'runway']]
    },
    {
      'id': 'aeroway-taxiway',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'aeroway',
      'minzoom': 13,
      'paint': {
        'line-color': dark ? 'rgb(97, 97, 97)' : 'rgb(227, 226, 226)',
        'line-width': {
          'stops': [
            [13, 0.5],
            [14, 1],
            [15, 2],
            [16, 4]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'taxiway']]
    },
    {
      'id': 'waterway_label',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'waterway',
      'layout': {
        'text-font': italicFonts,
        'text-size': {
          'stops': [
            [9, 8],
            [10, 9]
          ]
        },
        'text-field': '{name_en}',
        'visibility': 'visible',
        'text-offset': {
          'stops': [
            [6, [0, -0.2]],
            [11, [0, -0.4]],
            [12, [0, -0.6]]
          ]
        },
        'text-padding': 2,
        'symbol-spacing': 300,
        'symbol-placement': 'line',
        'text-keep-upright': true,
        'symbol-avoid-edges': false,
        'text-letter-spacing': 0,
        'text-pitch-alignment': 'auto',
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(129, 173, 235, 1)' : 'rgb(45, 113, 218)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgb(240, 245, 252)',
        'text-halo-width': 1
      },
      'filter': ['all', ['has', 'name'], ['==', 'class', 'river']]
    },
    {
      'id': 'tunnel_service_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [15, 1],
            [16, 3],
            [17, 6],
            [18, 8]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'service'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_minor_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'miter'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [11, 0.5],
            [12, 0.5],
            [14, 2],
            [15, 4],
            [16, 6],
            [17, 10],
            [18, 14]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'minor'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_sec_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [11, 0.5],
            [12, 1],
            [13, 2],
            [14, 5],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_pri_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 8,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10],
            [17, 14],
            [18, 18]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'primary'], ['!=', 'ramp', 1], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_trunk_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 5,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10],
            [17, 14],
            [18, 18]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['!=', 'ramp', 1], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_mot_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 5,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [12, 4],
            [13, 5],
            [14, 7],
            [15, 9],
            [16, 11],
            [17, 13],
            [18, 22]
          ]
        },
        'line-opacity': {
          'stops': [
            [6, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['!=', 'ramp', 1], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_path',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(80, 80, 80)' : 'rgb(210, 209, 209)',
        'line-width': {
          'stops': [
            [15, 0.5],
            [16, 1],
            [18, 3]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'path'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_service_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [15, 2],
            [16, 2],
            [17, 4],
            [18, 6]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'service'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_minor_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [15, 3],
            [16, 4],
            [17, 8],
            [18, 12]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'minor'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_sec_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [11, 2],
            [13, 2],
            [14, 3],
            [15, 4],
            [16, 6],
            [17, 10],
            [18, 14]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_pri_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [11, 1],
            [13, 2],
            [14, 4],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'primary'], ['!=', 'ramp', 1], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_trunk_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [11, 1],
            [13, 2],
            [14, 4],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['!=', 'ramp', 1], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_mot_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 10,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 0)' : 'rgb(163, 163, 152)',
        'line-width': {
          'stops': [
            [10, 1],
            [12, 2],
            [13, 3],
            [14, 5],
            [15, 7],
            [16, 9],
            [17, 11],
            [18, 20]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['!=', 'ramp', 1], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_rail',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'layout': {
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(86, 86, 86)' : 'rgb(216, 215, 215)',
        'line-width': {
          'base': 1.3,
          'stops': [
            [13, 0.5],
            [14, 1],
            [15, 1],
            [16, 3],
            [21, 7]
          ]
        },
        'line-opacity': 0.5
      },
      'filter': ['all', ['==', 'class', 'rail'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'tunnel_rail_dash',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'layout': {
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(120, 120, 120)' : 'rgb(250, 249, 249)',
        'line-width': {
          'base': 1.3,
          'stops': [
            [15, 0.5],
            [16, 1],
            [20, 5]
          ]
        },
        'line-opacity': 0.5
      },
      'filter': ['all', ['==', 'class', 'rail'], ['==', 'brunnel', 'tunnel']]
    },
    {
      'id': 'road_area_pier',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': dark ? '#fbf8f3' : '#fbf8f3',
        'fill-antialias': true
      },
      'metadata': {},
      'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'class', 'pier']]
    },
    {
      'id': 'road_pier',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? '#fbf8f3' : '#fbf8f3',
        'line-width': {
          'base': 1.2,
          'stops': [
            [15, 1],
            [17, 4]
          ]
        }
      },
      'metadata': {},
      'filter': ['all', ['==', '$type', 'LineString'], ['in', 'class', 'pier']]
    },
    {
      'id': 'road_area_bridge',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': dark ? 'rgba(246, 241, 229, 0.6)' : 'rgba(246, 241, 229, 0.6)',
        'fill-antialias': true
      },
      'metadata': {},
      'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'road_service_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [15, 1],
            [16, 3],
            [17, 6],
            [18, 8]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'service'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_minor_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 0.5],
            [12, 0.5],
            [14, 2],
            [15, 3],
            [16, 4.3],
            [17, 10],
            [18, 14]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'minor'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_pri_case_ramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 12,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [12, 2],
            [13, 3],
            [14, 4],
            [15, 5],
            [16, 8],
            [17, 10]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'primary'], ['==', 'ramp', 1]]
    },
    {
      'id': 'road_trunk_case_ramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 12,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [12, 2],
            [13, 3],
            [14, 4],
            [15, 5],
            [16, 8],
            [17, 10]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['==', 'ramp', 1]]
    },
    {
      'id': 'road_mot_case_ramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 12,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [12, 2],
            [13, 3],
            [14, 4],
            [15, 5],
            [16, 8],
            [17, 10]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['==', 'ramp', 1]]
    },
    {
      'id': 'road_sec_case_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 0.5],
            [12, 1.5],
            [13, 3],
            [14, 5],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_pri_case_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 7,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10],
            [17, 14],
            [18, 18]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'primary'], ['!=', 'ramp', 1], ['!has', 'brunnel']]
    },
    {
      'id': 'road_trunk_case_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 5,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10],
            [17, 14],
            [18, 18]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['!=', 'ramp', 1], ['!has', 'brunnel']]
    },
    {
      'id': 'road_mot_case_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 5,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.7],
            [8, 0.8],
            [11, 3],
            [12, 4],
            [13, 5],
            [14, 7],
            [15, 9],
            [16, 11],
            [17, 13],
            [18, 22]
          ]
        },
        'line-opacity': {
          'stops': [
            [6, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['!=', 'ramp', 1], ['!has', 'brunnel']]
    },
    {
      'id': 'road_path',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(80, 80, 80)' : 'rgb(210, 209, 209)',
        'line-width': {
          'stops': [
            [15, 0.5],
            [16, 1],
            [18, 3]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'path', 'track'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_service_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgba(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [15, 2],
            [16, 2],
            [17, 4],
            [18, 6]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'service'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_minor_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [15, 3],
            [16, 4],
            [17, 8],
            [18, 12]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'minor'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_pri_fill_ramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 12,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [12, 1],
            [13, 1.5],
            [14, 2],
            [15, 3],
            [16, 6],
            [17, 8]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'primary'], ['==', 'ramp', 1]]
    },
    {
      'id': 'road_trunk_fill_ramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 12,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'square',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [12, 1],
            [13, 1.5],
            [14, 2],
            [15, 3],
            [16, 6],
            [17, 8]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['==', 'ramp', 1]]
    },
    {
      'id': 'road_mot_fill_ramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 12,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [12, 1],
            [13, 1.5],
            [14, 2],
            [15, 3],
            [16, 6],
            [17, 8]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['==', 'ramp', 1]]
    },
    {
      'id': 'road_sec_fill_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 2],
            [13, 2],
            [14, 3],
            [15, 4],
            [16, 6],
            [17, 10],
            [18, 14]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary'], ['!has', 'brunnel']]
    },
    {
      'id': 'road_pri_fill_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 10,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [10, 0.3],
            [13, 2],
            [14, 4],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'primary'], ['!=', 'ramp', 1], ['!has', 'brunnel']]
    },
    {
      'id': 'road_trunk_fill_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 10,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 1],
            [13, 2],
            [14, 4],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['!=', 'ramp', 1], ['!has', 'brunnel']]
    },
    {
      'id': 'road_mot_fill_noramp',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 10,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [10, 1],
            [12, 2],
            [13, 3],
            [14, 5],
            [15, 7],
            [16, 9],
            [17, 11],
            [18, 20]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['!=', 'ramp', 1], ['!has', 'brunnel']]
    },
    {
      'id': 'rail',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'layout': {
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(153, 153, 169)' : 'rgb(153, 153, 169)',
        'line-width': {
          'base': 1.3,
          'stops': [
            [13, 0.5],
            [14, 1],
            [15, 1],
            [16, 3],
            [21, 7]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'rail'], ['!=', 'brunnel', 'tunnel']]
    },
    {
      'id': 'rail_dash',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'layout': {
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(120, 120, 120)' : 'rgb(250, 249, 249)',
        'line-width': {
          'base': 1.3,
          'stops': [
            [15, 0.5],
            [16, 1],
            [20, 5]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'rail'], ['!=', 'brunnel', 'tunnel']]
    },
    {
      'id': 'bridge_service_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [15, 1],
            [16, 3],
            [17, 6],
            [18, 8]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'service'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_minor_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'miter'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 0.5],
            [12, 0.5],
            [14, 2],
            [15, 3],
            [16, 4.3],
            [17, 10],
            [18, 14]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'minor'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_sec_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'miter'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 0.5],
            [12, 1.5],
            [13, 3],
            [14, 5],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_pri_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 8,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10],
            [17, 14],
            [18, 18]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'primary'], ['!=', 'ramp', 1], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_trunk_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 5,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [13, 4],
            [14, 6],
            [15, 8],
            [16, 10],
            [17, 14],
            [18, 18]
          ]
        },
        'line-opacity': {
          'stops': [
            [5, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['!=', 'ramp', 1], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_mot_case',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 5,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [6, 0.5],
            [7, 0.8],
            [8, 1],
            [11, 3],
            [12, 4],
            [13, 5],
            [14, 7],
            [15, 9],
            [16, 11],
            [17, 13],
            [18, 22]
          ]
        },
        'line-opacity': {
          'stops': [
            [6, 0.5],
            [7, 1]
          ]
        }
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['!=', 'ramp', 1], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_path',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(80, 80, 80)' : 'rgb(210, 209, 209)',
        'line-width': {
          'stops': [
            [15, 0.5],
            [16, 1],
            [18, 3]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'path'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_service_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [15, 2],
            [16, 2],
            [17, 4],
            [18, 6]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'service'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_minor_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 15,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [15, 3],
            [16, 4],
            [17, 8],
            [18, 12]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'minor'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_sec_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 13,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 2],
            [13, 2],
            [14, 3],
            [15, 4],
            [16, 6],
            [17, 10],
            [18, 14]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary'], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_pri_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 1],
            [13, 2],
            [14, 4],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'primary'], ['!=', 'ramp', 1], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_trunk_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 11,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [11, 1],
            [13, 2],
            [14, 4],
            [15, 6],
            [16, 8],
            [17, 12],
            [18, 16]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'trunk'], ['!=', 'ramp', 1], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'bridge_mot_fill',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'transportation',
      'minzoom': 10,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'butt',
        'line-join': 'round'
      },
      'paint': {
        'line-color': dark ? 'rgb(0, 0, 40)' : 'rgb(217, 217, 211)',
        'line-width': {
          'stops': [
            [10, 1],
            [12, 2],
            [13, 3],
            [14, 5],
            [15, 7],
            [16, 9],
            [17, 11],
            [18, 20]
          ]
        },
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'class', 'motorway'], ['!=', 'ramp', 1], ['==', 'brunnel', 'bridge']]
    },
    {
      'id': 'building',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'building',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': {
          'stops': [
            [15, dark ? 'rgba(7, 72, 89, 1)' : 'rgba(255, 255, 255, 1)'],
            [16, dark ? 'rgba(7, 72, 89, 1)' : 'rgba(152, 145, 123, 0.18)']
          ]
        },
        'fill-antialias': true
      }
    },
    {
      'id': 'building-top',
      'type': 'fill',
      'source': 'openmaptiles',
      'source-layer': 'building',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': dark ? 'rgba(7, 72, 89, 1)' : 'rgba(164, 146, 127, 1)',
        'fill-opacity': {
          'base': 1,
          'stops': [
            [13, 0],
            [16, 1]
          ]
        },
        'fill-translate': {
          'base': 1,
          'stops': [
            [14, [0, 0]],
            [16, [-2, -2]]
          ]
        },
        'fill-outline-color': 'rgba(255, 255, 255, 1)'
      }
    },
    {
      'id': 'boundary_country_outline',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'boundary',
      'minzoom': 6,
      'maxzoom': 24,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.7)',
        'line-width': 4,
        'line-offset': 0,
        'line-opacity': 0.5
      },
      'filter': ['all', ['==', 'admin_level', 2], ['==', 'maritime', 0], ['==', 'disputed', 0]]
    },
    {
      'id': 'boundary_country_inner_z0-4',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'boundary',
      'minzoom': 0,
      'maxzoom': 5,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': {
          'stops': [
            [4, dark ? 'rgba(68, 73, 76, 0.8)' : 'rgba(151, 151, 151, 0.3)'],
            [5, dark ? 'rgba(163, 168, 173, 0.6)' : 'rgba(151, 151, 151, 0.51)'],
            [6, dark ? 'rgba(163, 168, 173, 0.6)' : 'rgba(151, 151, 151, 0.5)']
          ]
        },
        'line-width': {
          'stops': [
            [3, 1],
            [6, 1.5]
          ]
        },
        'line-offset': 0,
        'line-opacity': 1
      },
      'filter': [
        'all',
        ['==', 'admin_level', 2],
        ['==', 'maritime', 0],
        ['!has', 'claimed_by'],
        ['==', 'disputed', 0]
      ]
    },
    {
      'id': 'boundary_country_inner_z5-',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'boundary',
      'minzoom': 5,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': {
          'stops': [
            [4, dark ? 'rgba(101, 106, 110, 0.72)' : 'rgba(127, 127, 127, 0.5)'],
            [5, dark ? 'rgba(131, 136, 142, 0.6)' : 'rgba(127, 127, 127, 0.5)'],
            [6, dark ? 'rgba(163, 168, 174, 0.8)' : 'rgba(127, 127, 127, 0.71)']
          ]
        },
        'line-width': {
          'stops': [
            [3, 1],
            [6, 1.5]
          ]
        },
        'line-offset': 0,
        'line-opacity': 1
      },
      'filter': ['all', ['==', 'admin_level', 2], ['==', 'maritime', 0], ['==', 'disputed', 0]]
    },
    {
      'id': 'boundary_2_disputed',
      'type': 'line',
      'source': 'openmaptiles',
      'source-layer': 'boundary',
      'minzoom': 0.0,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round',
        'visibility': 'visible'
      },
      'paint': {
        'line-color': {
          'stops': [
            [4, dark ? 'rgba(101, 106, 110, 0.72)' : 'rgba(127, 127, 127, 0.5)'],
            [5, dark ? 'rgba(131, 136, 142, 0.6)' : 'rgba(127, 127, 127, 0.5)'],
            [6, dark ? 'rgba(163, 168, 174, 0.8)' : 'rgba(127, 127, 127, 0.71)']
          ]
        },
        'line-width': {
          'base': 1,
          'stops': [
            [3, 0.3],
            [5, 1.2],
            [12, 2]
          ]
        },
        'line-opacity': 1,
        'line-dasharray': [4, 3]
      },
      'metadata': {},
      'filter': ['all', ['==', 'admin_level', 2], ['==', 'disputed', 1], ['==', 'maritime', 0]]
    },
    {
      'id': 'watername_ocean',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'water_name',
      'minzoom': 0,
      'maxzoom': 5,
      'layout': {
        'text-font': italicFonts,
        'text-size': {
          'stops': [
            [0, 13],
            [2, 14],
            [4, 18]
          ]
        },
        'text-field': '{name}',
        'text-padding': 2,
        'text-max-width': 6,
        'symbol-placement': 'point',
        'text-line-height': 1.2,
        'text-allow-overlap': false,
        'text-letter-spacing': 0.1,
        'text-pitch-alignment': 'auto',
        'text-ignore-placement': false,
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(179, 179, 190, 1)' : 'rgba(98, 143, 211, 1)',
        'text-halo-blur': 0,
        'text-halo-color': dark ? 'rgb(10, 21, 40)' : 'rgba(255, 255, 255, 0.47)',
        'text-halo-width': 1
      },
      'filter': ['all', ['has', 'name'], ['==', '$type', 'Point'], ['==', 'class', 'ocean']]
    },
    {
      'id': 'watername_sea',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'water_name',
      'minzoom': 5,
      'layout': {
        'text-font': italicFonts,
        'text-size': 12,
        'text-field': '{name}',
        'text-padding': 2,
        'text-max-width': 6,
        'symbol-placement': 'point',
        'text-line-height': 1.2,
        'text-allow-overlap': false,
        'text-letter-spacing': 0.1,
        'text-pitch-alignment': 'auto',
        'text-ignore-placement': false,
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(179, 179, 190, 1)' : 'rgba(96, 131, 180, 1)',
        'text-halo-blur': 0,
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1
      },
      'filter': ['all', ['has', 'name'], ['==', '$type', 'Point'], ['==', 'class', 'sea']]
    },
    {
      'id': 'watername_lake',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'water_name',
      'minzoom': 4,
      'layout': {
        'text-font': italicFonts,
        'text-size': {
          'stops': [
            [13, 9],
            [14, 10],
            [15, 11],
            [16, 12],
            [17, 13]
          ]
        },
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'text-padding': 2,
        'symbol-placement': 'point',
        'text-line-height': 1.2,
        'text-allow-overlap': false,
        'text-pitch-alignment': 'auto',
        'text-ignore-placement': false,
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(210, 226, 247, 1)' : 'rgb(45, 113, 218)',
        'text-halo-blur': 1,
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgb(240, 245, 252)',
        'text-halo-width': 1
      },
      'filter': ['all', ['has', 'name'], ['==', '$type', 'Point'], ['==', 'class', 'lake']]
    },
    {
      'id': 'watername_lake_line',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'water_name',
      'layout': {
        'text-font': italicFonts,
        'text-size': {
          'stops': [
            [13, 9],
            [14, 10],
            [15, 11],
            [16, 12],
            [17, 13]
          ]
        },
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'symbol-spacing': 350,
        'symbol-placement': 'line',
        'text-line-height': 1.2,
        'text-pitch-alignment': 'auto',
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(129, 173, 235, 1)' : 'rgb(45, 113, 218)',
        'text-halo-blur': 1,
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgb(240, 245, 252)',
        'text-halo-width': 1
      },
      'filter': ['all', ['has', 'name'], ['==', '$type', 'LineString']]
    },
    {
      'id': 'park-label',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'park',
      'minzoom': 0,
      'layout': {
        'text-font': regularFonts,
        'text-size': {
          'base': 1.2,
          'stops': [
            [12, 10],
            [15, 14]
          ]
        },
        'text-field': '{name:latin}\n{name:nonlatin}',
        'visibility': 'visible',
        'text-max-width': 9,
        'text-transform': 'none',
        'text-allow-overlap': false,
        'text-letter-spacing': 0.1,
        'text-ignore-placement': false
      },
      'paint': {
        'text-color': dark ? 'rgba(40, 191, 102, 1)' : 'rgba(29, 176, 51, 1)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255,255,255,0.8)',
        'text-halo-width': 1.2
      },
      'metadata': {
        'mapbox:group': '1444849242106.713'
      },
      'filter': ['all', ['==', 'rank', 1], ['==', '$type', 'Point']]
    },
    {
      'id': 'place_hamlet',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 12,
      'maxzoom': 16,
      'layout': {
        'icon-size': 1,
        'text-font': regularFonts,
        'text-size': {
          'stops': [
            [13, 8],
            [14, 10],
            [16, 11]
          ]
        },
        'icon-image': '',
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [14, '{name}']
          ]
        },
        'icon-offset': [16, 0],
        'text-anchor': 'center',
        'text-offset': [0.2, 0.2],
        'text-max-width': 10,
        'text-transform': {
          'stops': [
            [12, 'none'],
            [14, 'uppercase']
          ]
        },
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(211, 211, 211, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(32, 32, 32, 1)' : 'rgb(219, 225, 230)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['any', ['==', 'class', 'neighbourhood'], ['==', 'class', 'hamlet']]
    },
    {
      'id': 'place_suburbs',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 12,
      'maxzoom': 16,
      'layout': {
        'icon-size': 1,
        'text-font': regularFonts,
        'text-size': {
          'stops': [
            [12, 9],
            [13, 10],
            [14, 11],
            [15, 12],
            [16, 13]
          ]
        },
        'icon-image': '',
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'icon-offset': [16, 0],
        'text-anchor': 'center',
        'text-offset': [0.2, 0.2],
        'text-max-width': 10,
        'text-transform': {
          'stops': [
            [8, 'none'],
            [12, 'uppercase']
          ]
        },
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(218, 218, 218, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(53, 53, 53, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'suburb']]
    },
    {
      'id': 'place_villages',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 10,
      'maxzoom': 16,
      'layout': {
        'icon-size': 1,
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [10, 9],
            [12, 10],
            [13, 11],
            [14, 12],
            [16, 13]
          ]
        },
        'icon-image': '',
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'icon-offset': [16, 0],
        'text-anchor': 'center',
        'text-offset': [0.2, 0.2],
        'text-max-width': 10,
        'text-transform': 'none',
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(166, 166, 166, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(7, 7, 7, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'village']]
    },
    {
      'id': 'place_town',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 8,
      'maxzoom': 14,
      'layout': {
        'icon-size': 1,
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [8, 10],
            [9, 10],
            [10, 11],
            [13, 14],
            [14, 15]
          ]
        },
        'icon-image': '',
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'icon-offset': [16, 0],
        'text-anchor': 'center',
        'text-offset': [0.2, 0.2],
        'text-max-width': 10,
        'text-transform': 'none',
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgba(191, 191, 191, 1)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(195, 195, 195, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(53, 53, 53, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'town']]
    },
    {
      'id': 'place_country_2',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 3,
      'maxzoom': 10,
      'layout': {
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [3, 10],
            [5, 11],
            [6, 12],
            [7, 13],
            [8, 14]
          ]
        },
        'text-field': '{name_en}',
        'text-transform': 'sentencecase'
      },
      'paint': {
        'text-color': {
          'stops': [
            [3, dark ? 'rgba(179, 179, 190, 1)' : 'rgb(101, 106, 110)'],
            [5, dark ? 'rgba(179, 179, 190, 1)' : 'rgb(127, 129, 131)'],
            [6, dark ? 'rgba(179, 179, 190, 1)' : 'rgba(131, 131, 131, 1)']
          ]
        },
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1
      },
      'filter': ['all', ['==', 'class', 'country'], ['>=', 'rank', 3], ['has', 'iso_a2']]
    },
    {
      'id': 'place_country_1',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 2,
      'maxzoom': 7,
      'layout': {
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [3, 11],
            [4, 12],
            [5, 13],
            [6, 14]
          ]
        },
        'text-field': '{name_en}',
        'text-max-width': {
          'stops': [
            [2, 6],
            [3, 6],
            [4, 9],
            [5, 12]
          ]
        },
        'text-transform': 'sentencecase'
      },
      'paint': {
        'text-color': {
          'stops': [
            [3, dark ? 'rgba(179, 179, 190, 1)' : 'rgba(114, 114, 114, 1)'],
            [5, dark ? 'rgba(179, 179, 190, 1)' : 'rgba(116, 116, 116, 1)'],
            [6, dark ? 'rgba(179, 179, 190, 1)' : 'rgba(116, 116, 116, 1)']
          ]
        },
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1
      },
      'filter': ['all', ['==', 'class', 'country'], ['<=', 'rank', 2]]
    },
    {
      'id': 'place_state',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 5,
      'maxzoom': 10,
      'layout': {
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [5, 12],
            [7, 14]
          ]
        },
        'text-field': '{name_en}',
        'text-max-width': 9,
        'text-transform': 'sentencecase'
      },
      'paint': {
        'text-color': dark ? 'rgba(179, 179, 190, 1)' : 'rgb(116, 119, 122)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgb(216, 238, 215)',
        'text-halo-width': 1
      },
      'filter': ['all', ['==', 'class', 'state'], ['<=', 'rank', 4]]
    },
    {
      'id': 'place_continent',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 0,
      'maxzoom': 2,
      'layout': {
        'text-font': boldFonts,
        'text-size': 14,
        'text-field': '{name_en}',
        'text-justify': 'center',
        'text-max-width': 9,
        'text-transform': 'uppercase',
        'text-keep-upright': false,
        'text-letter-spacing': 0.1
      },
      'paint': {
        'text-color': dark ? 'rgba(209, 209, 209, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1
      },
      'filter': ['all', ['==', 'class', 'continent']]
    },
    {
      'id': 'place_city_r6',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 8,
      'maxzoom': 15,
      'layout': {
        'icon-size': 1,
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [8, 12],
            [9, 13],
            [10, 14],
            [13, 17],
            [14, 20]
          ]
        },
        'icon-image': '',
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'icon-offset': [16, 0],
        'text-anchor': 'center',
        'text-offset': [0.2, 0.2],
        'text-max-width': 10,
        'text-transform': 'uppercase',
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(217, 217, 217, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'city'], ['>=', 'rank', 6]]
    },
    {
      'id': 'place_city_r5',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 8,
      'maxzoom': 15,
      'layout': {
        'icon-size': 1,
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [8, 14],
            [10, 16],
            [13, 19],
            [14, 22]
          ]
        },
        'icon-image': '',
        'text-field': {
          'stops': [
            [8, '{name_en}'],
            [13, '{name}']
          ]
        },
        'icon-offset': [16, 0],
        'text-anchor': 'center',
        'text-offset': [0.2, 0.2],
        'text-max-width': 10,
        'text-transform': 'uppercase',
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(209, 209, 209, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'city'], ['>=', 'rank', 0], ['<=', 'rank', 5]]
    },
    {
      'id': 'place_city_dot_r7',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 6,
      'maxzoom': 7,
      'layout': {
        'icon-size': 0.4,
        'text-font': boldFonts,
        'text-size': 12,
        'icon-image': 'circle-11',
        'text-field': '{name_en}',
        'icon-offset': [16, 5],
        'text-anchor': 'right',
        'text-offset': [0.2, 0.2],
        'text-max-width': 8,
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(193, 193, 193, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'city'], ['<=', 'rank', 7]]
    },
    {
      'id': 'place_city_dot_r4',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 5,
      'maxzoom': 7,
      'layout': {
        'icon-size': 0.4,
        'text-font': boldFonts,
        'text-size': 12,
        'icon-image': 'circle-11',
        'text-field': '{name_en}',
        'icon-offset': [16, 5],
        'text-anchor': 'right',
        'text-offset': [0.2, 0.2],
        'text-max-width': 8,
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(196, 200, 204, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'city'], ['<=', 'rank', 4]]
    },
    {
      'id': 'place_city_dot_r2',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 4,
      'maxzoom': 7,
      'layout': {
        'icon-size': 0.4,
        'text-font': boldFonts,
        'text-size': 12,
        'icon-image': 'circle-11',
        'text-field': '{name_en}',
        'icon-offset': [16, 5],
        'text-anchor': 'right',
        'text-offset': [0.2, 0.2],
        'text-max-width': 8,
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(196, 200, 204, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['==', 'class', 'city'], ['<=', 'rank', 2]]
    },
    {
      'id': 'place_city_dot_z7',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 7,
      'maxzoom': 8,
      'layout': {
        'icon-size': 0.4,
        'text-font': boldFonts,
        'text-size': 12,
        'icon-image': 'circle-11',
        'text-field': '{name_en}',
        'icon-offset': [16, 5],
        'text-anchor': 'right',
        'text-offset': [0.2, 0.2],
        'text-max-width': 8,
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(209, 209, 209, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(34, 34, 34, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['!has', 'capital'], ['!in', 'class', 'country', 'state']]
    },
    {
      'id': 'place_capital_dot_z7',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'place',
      'minzoom': 7,
      'maxzoom': 8,
      'layout': {
        'icon-size': 0.4,
        'text-font': boldFonts,
        'text-size': 12,
        'icon-image': 'circle-11',
        'text-field': '{name_en}',
        'icon-offset': [16, 5],
        'text-anchor': 'right',
        'text-offset': [0.2, 0.2],
        'text-max-width': 8,
        'text-transform': 'uppercase',
        'text-keep-upright': true
      },
      'paint': {
        'icon-color': dark ? 'rgb(30, 40, 46)' : 'rgb(57, 74, 86)',
        'text-color': dark ? 'rgba(201, 201, 201, 1)' : 'rgb(57, 74, 86)',
        'text-halo-color': dark ? 'rgba(30, 30, 30, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1,
        'icon-translate-anchor': 'map'
      },
      'filter': ['all', ['>', 'capital', 0]]
    },
    {
      'id': 'poi_stadium',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'poi',
      'minzoom': 15,
      'layout': {
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [15, 8],
            [17, 9],
            [18, 10]
          ]
        },
        'text-field': '{name}',
        'text-transform': 'uppercase'
      },
      'paint': {
        'text-color': dark ? 'rgb(48, 48, 48)' : 'rgb(82, 82, 82)',
        'text-halo-color': dark ? 'rgba(201, 201, 201, 0.15)' : 'rgba(234, 234, 234, 0.15)',
        'text-halo-width': 1
      },
      'filter': ['all', ['in', 'class', 'stadium', 'cemetery', 'attraction'], ['<=', 'rank', 3]]
    },
    {
      'id': 'poi_park',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'poi',
      'minzoom': 15,
      'layout': {
        'text-font': boldFonts,
        'text-size': {
          'stops': [
            [15, 8],
            [17, 9],
            [18, 10]
          ]
        },
        'text-field': '{name}',
        'text-transform': 'uppercase'
      },
      'paint': {
        'text-color': dark ? 'rgba(193, 242, 214, 1)' : 'rgb(82, 82, 82)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(234, 234, 234, 0.15)',
        'text-halo-width': 1
      },
      'filter': ['all', ['==', 'class', 'park']]
    },
    {
      'id': 'roadname_minor',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'transportation_name',
      'minzoom': 16,
      'layout': {
        'text-font': regularFonts,
        'text-size': 9,
        'text-field': '{name}',
        'text-justify': 'center',
        'symbol-spacing': 200,
        'symbol-placement': 'line',
        'symbol-avoid-edges': false,
        'text-pitch-alignment': 'auto',
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(255, 255, 255, 1)' : 'rgba(73, 73, 53, 1)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1
      },
      'filter': ['all', ['in', 'class', 'minor', 'service']]
    },
    {
      'id': 'roadname_sec',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'transportation_name',
      'minzoom': 15,
      'layout': {
        'text-font': regularFonts,
        'text-size': {
          'stops': [
            [15, 9],
            [16, 11],
            [18, 12]
          ]
        },
        'text-field': '{name}',
        'text-justify': 'center',
        'symbol-spacing': 200,
        'symbol-placement': 'line',
        'symbol-avoid-edges': false,
        'text-pitch-alignment': 'auto',
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgba(255, 255, 255, 1)' : 'rgba(90, 92, 71, 1)',
        'text-halo-color': dark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        'text-halo-width': 1
      },
      'filter': ['all', ['in', 'class', 'secondary', 'tertiary']]
    },
    {
      'id': 'roadname_pri',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'transportation_name',
      'minzoom': 14,
      'layout': {
        'text-font': regularFonts,
        'text-size': {
          'stops': [
            [14, 10],
            [15, 10],
            [16, 11],
            [18, 12]
          ]
        },
        'text-field': '{name}',
        'text-justify': 'center',
        'symbol-spacing': {
          'stops': [
            [6, 200],
            [16, 250]
          ]
        },
        'symbol-placement': 'line',
        'symbol-avoid-edges': false,
        'text-letter-spacing': {
          'stops': [
            [14, 0],
            [16, 0.2]
          ]
        },
        'text-pitch-alignment': 'auto',
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        'text-halo-color': dark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
        'text-halo-width': 1
      },
      'filter': ['all', ['in', 'class', 'primary']]
    },
    {
      'id': 'roadname_major',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'transportation_name',
      'minzoom': 13,
      'layout': {
        'text-font': regularFonts,
        'text-size': {
          'stops': [
            [14, 10],
            [15, 10],
            [16, 11],
            [18, 12]
          ]
        },
        'text-field': '{name}',
        'text-justify': 'center',
        'symbol-spacing': {
          'stops': [
            [6, 200],
            [16, 250]
          ]
        },
        'symbol-placement': 'line',
        'symbol-avoid-edges': false,
        'text-letter-spacing': {
          'stops': [
            [13, 0],
            [16, 0.2]
          ]
        },
        'text-pitch-alignment': 'auto',
        'text-rotation-alignment': 'auto'
      },
      'paint': {
        'text-color': dark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        'text-halo-color': dark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
        'text-halo-width': 1
      },
      'filter': ['all', ['in', 'class', 'trunk', 'motorway']]
    },
    {
      'id': 'housenumber',
      'type': 'symbol',
      'source': 'openmaptiles',
      'source-layer': 'housenumber',
      'minzoom': 17,
      'maxzoom': 24,
      'layout': {
        'text-font': regularFonts,
        'text-size': {
          'stops': [
            [17, 9],
            [18, 11]
          ]
        },
        'text-field': '{housenumber}'
      },
      'paint': {
        'text-color': dark ? 'rgb(69, 158, 124)' : 'rgba(255, 255, 255, 1)',
        'text-halo-color': dark ? 'rgba(201, 201, 201, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        'text-halo-width': 0.75
      }
    }
  ],
  'metadata': {
    'maptiler:copyright':
      'This style was generated on MapTiler Cloud. Usage outside of MapTiler Cloud or MapTiler Server requires valid MapTiler Data package: https://www.maptiler.com/data/ -- please contact us.'
  },
  'glyphs': `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${key}`,
  'sprite': 'https://api.maptiler.com/maps/17edd8b7-a153-4528-b076-32743671d394/sprite',
  'bearing': 0,
  'pitch': 0,
  'center': [8.611423932402658, 46.76324669153797],
  'zoom': 6.680213932099212
});
