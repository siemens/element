/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createClusterConfiguration, createClusterGradient } from './cluster.utils';

const clusterFeature = (properties: GeoJSON.GeoJsonProperties): GeoJSON.Feature<GeoJSON.Point> => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [8, 47] },
  properties
});

describe('cluster utils', () => {
  it('generates fixed four-color status group palette for positive group IDs', () => {
    const configuration = createClusterConfiguration('status', 'group');

    expect(configuration.segments).toHaveLength(4);
    expect(configuration.segments[0]).toEqual({
      color: 'var(--si-sys-background-information)',
      property: 'si_group_0'
    });
    expect(configuration.clusterProperties.si_group_0).toEqual([
      '+',
      [
        'case',
        [
          'all',
          ['>', ['to-number', ['get', 'group'], 0], 0],
          ['==', ['%', ['-', ['to-number', ['get', 'group'], 0], 1], 4], 0]
        ],
        1,
        0
      ]
    ]);
  });

  it('generates exact buckets for custom group colors', () => {
    const configuration = createClusterConfiguration(
      { 3: 'blue', 1: 'red', 0: 'ignored' },
      'category'
    );

    expect(configuration.segments).toEqual([
      { color: 'red', property: 'si_group_1' },
      { color: 'blue', property: 'si_group_3' }
    ]);
    expect(configuration.clusterProperties).toMatchObject({
      si_group_1: ['+', ['case', ['==', ['to-number', ['get', 'category'], 0], 1], 1, 0]],
      si_group_3: ['+', ['case', ['==', ['to-number', ['get', 'category'], 0], 3], 1, 0]]
    });
  });

  it('creates a conic gradient and includes ungrouped points as a neutral segment', () => {
    const gradient = createClusterGradient(
      clusterFeature({ point_count: 10, si_group_0: 6, si_group_1: 2 }),
      [
        { color: 'red', property: 'si_group_0' },
        { color: 'blue', property: 'si_group_1' }
      ]
    );

    expect(gradient).toContain('conic-gradient(from -90deg');
    expect(gradient).toContain('red');
    expect(gradient).toContain('blue');
    expect(gradient).toContain('var(--si-sys-background-accent)');
    expect(gradient).toContain('var(--si-sys-background-1)');
  });

  it('uses a neutral color when a cluster has no configured group', () => {
    expect(createClusterGradient(clusterFeature({ point_count: 2 }), [])).toBe(
      'conic-gradient(from -90deg, var(--si-sys-background-accent) 0deg 360deg)'
    );
  });

  it('does not add status buckets unless a status property is configured', () => {
    const configuration = createClusterConfiguration('status', 'group');

    expect(configuration.segments).toHaveLength(4);
    expect(configuration.clusterProperties.si_status_caution).toBeUndefined();
  });

  it('generates fixed status buckets for an explicit top-level property', () => {
    const configuration = createClusterConfiguration('status', 'group', 'status');

    expect(configuration.segments).toHaveLength(12);
    expect(configuration.segments.slice(4)).toEqual([
      { color: 'var(--si-sys-background-information)', property: 'si_status_info' },
      { color: 'var(--si-sys-background-success)', property: 'si_status_success' },
      { color: 'var(--si-sys-background-warning)', property: 'si_status_warning' },
      { color: 'var(--si-sys-background-danger)', property: 'si_status_danger' },
      { color: 'var(--si-sys-background-caution)', property: 'si_status_caution' },
      { color: 'var(--si-sys-background-critical)', property: 'si_status_critical' },
      { color: 'var(--si-sys-background-accent)', property: 'si_status_default' },
      { color: 'var(--si-sys-background-neutral)', property: 'si_status_unknown' }
    ]);
    expect(configuration.clusterProperties.si_status_caution).toEqual([
      '+',
      [
        'case',
        [
          'all',
          ['==', ['to-number', ['get', 'group'], 0], 0],
          ['==', ['get', 'status'], 'caution']
        ],
        1,
        0
      ]
    ]);
  });

  it('mixes group, status and ungrouped segments in the gradient', () => {
    const gradient = createClusterGradient(
      clusterFeature({
        point_count: 5,
        si_group_0: 1,
        si_status_caution: 2
      }),
      [
        { color: 'red', property: 'si_group_0' },
        { color: 'yellow', property: 'si_status_caution' }
      ]
    );

    expect(gradient).toContain('red');
    expect(gradient).toContain('yellow');
    expect(gradient).toContain('var(--si-sys-background-accent)');
  });
});
