/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterPoint, ClusterSegment } from './cluster-types';
import { SiClusterMarkerComponent as TestComponent } from './si-cluster-marker.component';

describe('SiClusterMarkerComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let feature: ReturnType<typeof signal<ClusterPoint>>;
  const markerClick = vi.fn();
  const segments: ClusterSegment[] = [
    { color: 'red', property: 'si_group_0' },
    { color: 'blue', property: 'si_group_1' }
  ];

  beforeEach(() => {
    feature = signal({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [8, 47] },
      properties: { cluster_id: 1, point_count: 120, si_group_0: 90, si_group_1: 30 }
    });
    markerClick.mockClear();
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('feature', feature),
        inputBinding('segments', () => segments),
        outputBinding('markerClick', markerClick)
      ]
    });
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders the capped count and accessible label', () => {
    const marker = element.querySelector('button')!;

    expect(marker).toHaveTextContent('99+');
    expect(marker).toHaveAttribute('aria-label', 'Cluster with 120 locations');
  });

  it('renders the group proportions as a CSS conic gradient', () => {
    const gradient = element
      .querySelector<HTMLElement>('button')!
      .style.getPropertyValue('--si-cluster-gradient');

    expect(gradient).toContain('conic-gradient');
    expect(gradient).toContain('red');
    expect(gradient).toContain('blue');
  });

  it('emits a click and stops propagation', () => {
    const marker = element.querySelector<HTMLButtonElement>('button')!;
    const parentClick = vi.fn();
    marker.parentElement!.addEventListener('click', parentClick);

    marker.click();

    expect(markerClick).toHaveBeenCalledOnce();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('renders counts up to 99 without abbreviation', async () => {
    feature.set({
      ...feature(),
      properties: { ...feature().properties, point_count: 99 }
    });
    await fixture.whenStable();

    expect(element.querySelector('button')).toHaveTextContent('99');
  });
});
