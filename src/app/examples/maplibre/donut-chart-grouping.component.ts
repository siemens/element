/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from '@angular/core';
import { MapService } from '@maplibre/ngx-maplibre-gl';

type Group = { id: number; count: number; color: string };
type GroupsInfo = { total: number; groups: Group[] };

@Component({
  selector: 'app-donut-chart-grouping',
  template: `<svg
    text-anchor="middle"
    [attr.width]="width()"
    [attr.height]="width()"
    [attr.viewBox]="viewBox()"
  >
    @if (groups().groups.length === 1) {
      <circle
        stroke="white"
        stroke-width="1"
        [attr.fill]="groups().groups[0].color"
        [attr.cx]="radius()"
        [attr.cy]="radius()"
        [attr.r]="radius()"
      />
    } @else {
      @for (segment of segmentAngles(); track $index) {
        <path stroke="white" stroke-width="1" [attr.d]="segment.path" [attr.fill]="segment.color" />
      }
    }
    <circle fill="white" [attr.cx]="radius()" [attr.cy]="radius()" [attr.r]="r0()" />
    <text dominant-baseline="central" [attr.transform]="translateCenter()">
      {{ text().toLocaleString() }}
    </text>
  </svg>`,
  host: { class: 'd-block' }
})
export class DonutChartGroupingComponent {
  protected readonly mapService = inject(MapService);
  readonly radius = input(20);
  readonly feature = input<GeoJSON.Feature>();
  readonly groupColors = input<Record<number, string>>({
    0: 'blue',
    1: 'red',
    2: 'green',
    3: 'blue',
    4: 'black'
  });
  protected readonly r0 = computed(() => Math.round(this.radius() * 0.6));
  protected readonly width = computed(() => 2 + this.radius() * 2);
  protected readonly viewBox = computed(() => `0 0 ${this.width()} ${this.width()}`);
  protected readonly translateCenter = computed(
    () => `translate(${this.radius()}, ${this.radius()})`
  );

  protected readonly text = computed(
    () => this.feature()?.properties?.point_count_abbreviated ?? 0
  );
  protected readonly groups = computed(() => {
    const groupCounts = Object.entries(this.feature()?.properties ?? {}).filter(([key]) =>
      /group\d+/.test(key)
    );
    const colors = this.groupColors();
    const groups: GroupsInfo = { total: 0, groups: [] };
    for (const [key, value] of groupCounts) {
      const id = parseInt(key.replace('group', ''));
      const color = colors[id % Object.keys(colors).length];
      groups.total += value;
      if (value > 0) {
        groups.groups.push({ id, count: value, color });
      }
    }
    return groups;
  });

  protected readonly segmentAngles = computed(() => {
    const groups = this.groups();
    if (groups.total === 0) {
      return [];
    }
    const segments: { path: string; color: string }[] = [];
    let offset = 0;
    const total = groups.total;
    const r = this.radius();
    const r0 = this.r0();

    for (const group of groups.groups) {
      const startAngle = (offset / total) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((offset + group.count) / total) * 2 * Math.PI - Math.PI / 2;

      // Calculate outer arc points
      const x1 = r + r * Math.cos(startAngle);
      const y1 = r + r * Math.sin(startAngle);
      const x2 = r + r * Math.cos(endAngle);
      const y2 = r + r * Math.sin(endAngle);

      // Calculate inner arc points
      const x3 = r + r0 * Math.cos(endAngle);
      const y3 = r + r0 * Math.sin(endAngle);
      const x4 = r + r0 * Math.cos(startAngle);
      const y4 = r + r0 * Math.sin(startAngle);

      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

      // Create SVG path for donut segment
      const path = [
        `M ${x1} ${y1}`, // Move to start of outer arc
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, // Outer arc
        `L ${x3} ${y3}`, // Line to inner arc
        `A ${r0} ${r0} 0 ${largeArc} 0 ${x4} ${y4}`, // Inner arc (reverse)
        'Z' // Close path
      ].join(' ');

      segments.push({ path, color: group.color });
      offset += group.count;
    }
    return segments;
  });
}
