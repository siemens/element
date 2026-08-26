/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { ClusterColors, ClusterPoint, ClusterSegment } from './cluster-types';
import type { MarkerStatus } from './marker-types';

type ClusterProperties = Record<string, ['+', unknown]>;

const MARKER_STATUS_COLORS = {
  info: 'var(--si-sys-background-information)',
  success: 'var(--si-sys-background-success)',
  warning: 'var(--si-sys-background-warning)',
  danger: 'var(--si-sys-background-danger)',
  caution: 'var(--si-sys-background-caution)',
  critical: 'var(--si-sys-background-critical)',
  default: 'var(--si-sys-background-accent)',
  unknown: 'var(--si-sys-background-neutral)'
} satisfies Record<MarkerStatus, string>;

// Keep the four-color status palette stable for numeric group IDs.
const GROUP_STATUS_COLORS = [
  MARKER_STATUS_COLORS.info,
  MARKER_STATUS_COLORS.success,
  MARKER_STATUS_COLORS.warning,
  MARKER_STATUS_COLORS.danger
];
const ELEMENT_COLORS = [
  'var(--si-sys-data-sequential-red-2)',
  'var(--si-sys-data-sequential-orange-4)',
  'var(--si-sys-background-caution)',
  'var(--si-sys-data-sequential-green-2)',
  'var(--si-sys-background-information)',
  'var(--si-sys-data-categorial-1)',
  'var(--si-sys-data-categorial-17)'
];
const UNGROUPED_COLOR = 'var(--si-sys-background-accent)';
const SEPARATOR_COLOR = 'var(--si-sys-background-1)';
const CHART_FRAGMENTS = 20;
const SEPARATOR_DEGREES = 2;

interface ClusterBucket extends ClusterSegment {
  mapExpression: unknown;
}

/** @internal */
export interface ClusterConfiguration {
  clusterProperties: ClusterProperties;
  segments: readonly ClusterSegment[];
}

/** @internal */
export const createClusterConfiguration = (
  groupColors: ClusterColors,
  groupProperty: string,
  statusProperty?: string
): ClusterConfiguration => {
  const group = ['to-number', ['get', groupProperty], 0];
  let buckets: ClusterBucket[];

  if (typeof groupColors === 'string') {
    const colors = groupColors === 'status' ? GROUP_STATUS_COLORS : ELEMENT_COLORS;
    buckets = colors.map((color, index) => ({
      color,
      mapExpression: [
        'case',
        ['all', ['>', group, 0], ['==', ['%', ['-', group, 1], colors.length], index]],
        1,
        0
      ],
      property: `si_group_${index}`
    }));
  } else {
    buckets = Object.entries(groupColors)
      .map(([groupId, color]) => ({ color, groupId: Number(groupId) }))
      .filter(bucket => Number.isInteger(bucket.groupId) && bucket.groupId > 0)
      .sort((a, b) => a.groupId - b.groupId)
      .map(bucket => ({
        color: bucket.color,
        mapExpression: ['case', ['==', group, bucket.groupId], 1, 0],
        property: `si_group_${bucket.groupId}`
      }));
  }

  if (statusProperty !== undefined) {
    for (const [status, color] of Object.entries(MARKER_STATUS_COLORS)) {
      buckets.push({
        color,
        mapExpression: [
          'case',
          ['all', ['==', group, 0], ['==', ['get', statusProperty], status]],
          1,
          0
        ],
        property: `si_status_${status}`
      });
    }
  }

  return {
    clusterProperties: Object.fromEntries(
      buckets.map(bucket => [bucket.property, ['+', bucket.mapExpression]])
    ),
    segments: buckets.map(({ color, property }) => ({ color, property }))
  };
};

/** @internal */
export const createClusterGradient = (
  feature: ClusterPoint,
  configuredSegments: readonly ClusterSegment[]
): string => {
  const count = getNumberProperty(feature, 'point_count');
  const segments = configuredSegments
    .map(segment => ({
      color: segment.color,
      count: getNumberProperty(feature, segment.property)
    }))
    .filter(segment => segment.count > 0);
  const groupedCount = segments.reduce((sum, segment) => sum + segment.count, 0);
  if (groupedCount < count) {
    segments.push({ color: UNGROUPED_COLOR, count: count - groupedCount });
  }
  if (!segments.length) {
    return UNGROUPED_COLOR;
  }

  const fragmentSize = count / CHART_FRAGMENTS;
  const weightedSegments = segments.map(segment => ({
    ...segment,
    weight: Math.max(1, segment.count / fragmentSize)
  }));
  const totalWeight = weightedSegments.reduce((sum, segment) => sum + segment.weight, 0);
  const separator =
    weightedSegments.length > 1 ? Math.min(SEPARATOR_DEGREES, 180 / totalWeight) : 0;
  let position = 0;
  const stops: string[] = [];
  for (const segment of weightedSegments) {
    const start = position;
    position += (segment.weight / totalWeight) * 360;
    if (separator) {
      stops.push(
        `${SEPARATOR_COLOR} ${start}deg ${start + separator / 2}deg`,
        `${segment.color} ${start + separator / 2}deg ${position - separator / 2}deg`,
        `${SEPARATOR_COLOR} ${position - separator / 2}deg ${position}deg`
      );
    } else {
      stops.push(`${segment.color} ${start}deg ${position}deg`);
    }
  }
  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
};

const getNumberProperty = (feature: ClusterPoint, property: string): number => {
  const value = feature.properties?.[property];
  return typeof value === 'number' ? value : Number(value) || 0;
};
