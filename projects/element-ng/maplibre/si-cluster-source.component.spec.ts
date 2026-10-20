/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  Binding,
  Component,
  contentChild,
  DebugElement,
  ElementRef,
  getDebugNode,
  input,
  inputBinding,
  output,
  outputBinding,
  TemplateRef,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ClusterPointDirective,
  GeoJSONSourceComponent,
  MapComponent,
  MarkerComponent,
  MarkersForClustersComponent
} from '@maplibre/ngx-maplibre-gl';
import { provideMaplibreWorker } from '@maplibre/ngx-maplibre-gl/config';
import type { StyleSpecification } from 'maplibre-gl';
import { page, userEvent } from 'vitest/browser';

import { ClusterPoint } from './cluster-types';
import { SiClusterPopoverComponent } from './si-cluster-popover.component';
import { SiClusterSourceComponent as TestComponent } from './si-cluster-source.component';

const point = (coordinates: [number, number], clusterId?: number): ClusterPoint => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates },
  properties: clusterId ? { cluster: true, cluster_id: clusterId, point_count: 2 } : {}
});

// Cluster coordinates are quantized to the tile grid and never match their children exactly.
const cluster = point([0.5, 0.5], 42);

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'mgl-markers-for-clusters',
  imports: [MarkerComponent, NgTemplateOutlet],
  template:
    '<mgl-marker [lngLat]="cluster.geometry.coordinates"><ng-container [ngTemplateOutlet]="template()" [ngTemplateOutletContext]="{ $implicit: cluster }" /></mgl-marker>'
})
class TestMarkersComponent {
  readonly source = input.required<string>();
  readonly template = contentChild.required<ClusterPointDirective, TemplateRef<unknown>>(
    ClusterPointDirective,
    { read: TemplateRef }
  );
  readonly cluster = cluster;
}

@Component({
  imports: [MapComponent, TestComponent, SiClusterPopoverComponent],
  template: `
    <mgl-map
      style="width: 800px; height: 600px"
      [mapStyle]="mapStyle"
      [center]="[0, 0]"
      [zoom]="4"
      [maxZoom]="22"
      [reduceMotion]="true"
      [interactive]="false"
      [attributionControl]="false"
    >
      <si-cluster-source
        #sourceElement
        sourceId="locations"
        [clusterMaxZoom]="clusterMaxZoom()"
        [zoomMaxLevel]="zoomMaxLevel()"
        [zoomOnClick]="zoomOnClick()"
        (clusterClick)="clusterClick.emit($event)"
      >
        @if (withPopover()) {
          <si-cluster-popover />
        }
      </si-cluster-source>
    </mgl-map>
  `
})
class TestHostComponent {
  readonly mapStyle = { version: 8, sources: {}, layers: [] } satisfies StyleSpecification;
  readonly clusterMaxZoom = input<number | undefined>(undefined);
  readonly zoomMaxLevel = input<number | undefined>(undefined);
  readonly zoomOnClick = input(true);
  readonly withPopover = input(false);
  readonly clusterClick = output<ClusterPoint>();
  readonly map = viewChild.required(MapComponent);
  readonly source = viewChild.required(TestComponent);
  readonly sourceElement = viewChild.required<TestComponent, ElementRef<HTMLElement>>(
    'sourceElement',
    { read: ElementRef }
  );
}

describe('SiClusterSourceComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let source: GeoJSONSourceComponent;
  let clusterClick: (p: ClusterPoint) => void;

  const create = (...bindings: Binding[]): void => {
    clusterClick = vi.fn();
    fixture = TestBed.createComponent(TestHostComponent, {
      bindings: [outputBinding('clusterClick', clusterClick), ...bindings]
    });
    fixture.detectChanges();
    source = (
      getDebugNode(fixture.componentInstance.sourceElement().nativeElement) as DebugElement
    ).query(By.directive(GeoJSONSourceComponent)).componentInstance as GeoJSONSourceComponent;
  };

  const clickMarker = async (): Promise<void> => {
    await userEvent.click(page.getByRole('button', { name: 'Cluster with 2 locations' }));
    await fixture.whenStable();
  };

  const getMapInstance = (): MapComponent['mapInstance'] =>
    fixture.componentInstance.map().mapInstance;

  const coordinatesAt = (x: number, y = 0): [number, number] => {
    const mapInstance = getMapInstance();
    const center = mapInstance.project(mapInstance.getCenter());
    const position = mapInstance.unproject([center.x + x, center.y + y]);
    return [position.lng, position.lat];
  };

  const pointAt = (x: number, y = 0): ClusterPoint => point(coordinatesAt(x, y));

  const startWaitingForMoveEnd = (): (() => Promise<void>) => {
    let moveEnded = false;
    getMapInstance().once('moveend', () => {
      moveEnded = true;
    });
    return () => vi.waitFor(() => expect(moveEnded).toBe(true));
  };

  const expectCamera = (center: [number, number], zoom: number): void => {
    const mapInstance = getMapInstance();
    expect(mapInstance.getCenter().lng).toBeCloseTo(center[0], 5);
    expect(mapInstance.getCenter().lat).toBeCloseTo(center[1], 5);
    expect(mapInstance.getZoom()).toBeCloseTo(zoom, 5);
  };

  const expectInitialCamera = (): void => {
    expectCamera([0, 0], 4);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMaplibreWorker('assets/maplibre/maplibre-gl-worker.mjs')]
    });
    TestBed.overrideComponent(TestComponent, {
      remove: { imports: [MarkersForClustersComponent] },
      add: { imports: [TestMarkersComponent] }
    });
  });

  it('frames the children of a clicked cluster and zooms until they fill the viewport', async () => {
    create();
    const getChildren = vi
      .spyOn(source, 'getClusterChildren')
      .mockResolvedValue([pointAt(90), pointAt(-90)]);
    const getLeaves = vi.spyOn(source, 'getClusterLeaves');
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();

    expect(getChildren).toHaveBeenCalledExactlyOnceWith(42);
    // 720px of usable width for a 180px span are two additional zoom levels.
    expectCamera([0, 0], 6);
    expect(clusterClick).not.toHaveBeenCalled();
    expect(getLeaves).not.toHaveBeenCalled();
  });

  it('centers the children instead of the cluster so outlying children stay visible', async () => {
    create();
    const expectedCenter = coordinatesAt(90);
    const children = [pointAt(0), pointAt(0), pointAt(180)];
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue(children);
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();

    expectCamera(expectedCenter, 6);
  });

  it('uses the smaller viewport axis to keep every child visible', async () => {
    create();
    const expectedCenter = coordinatesAt(45);
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(90, 65), pointAt(0, -65)]);
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();

    // 520px of usable height for a 130px span are two additional zoom levels.
    expectCamera(expectedCenter, 6);
  });

  it('emits a cluster click when the children share the same position', async () => {
    create();
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(0), pointAt(0)]);

    await clickMarker();

    expect(clusterClick).toHaveBeenCalledExactlyOnceWith(cluster);
    expectInitialCamera();
  });

  it('emits a cluster click when the children stay clustered up to the clustering zoom', async () => {
    create();
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(0.002), pointAt(-0.002)]);

    await clickMarker();

    expect(clusterClick).toHaveBeenCalledExactlyOnceWith(cluster);
    expectInitialCamera();
  });

  it('expands up to a raised clustering zoom', async () => {
    create(inputBinding('clusterMaxZoom', () => 20));
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(0.002), pointAt(-0.002)]);
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();

    expectCamera([0, 0], 20);
    expect(clusterClick).not.toHaveBeenCalled();
  });

  it('clamps the zoom to the configured maximum level', async () => {
    create(inputBinding('zoomMaxLevel', () => 5));
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(90), pointAt(-90)]);
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();

    expectCamera([0, 0], 5);
    expect(clusterClick).not.toHaveBeenCalled();
  });

  it('emits a cluster click when the children stay clustered up to the maximum level', async () => {
    create(inputBinding('zoomMaxLevel', () => 5));
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(0.02), pointAt(-0.02)]);

    await clickMarker();

    expect(clusterClick).toHaveBeenCalledExactlyOnceWith(cluster);
    expectInitialCamera();
  });

  it('emits a cluster click without resolving children when zooming is disabled', async () => {
    create(inputBinding('zoomOnClick', () => false));
    const getChildren = vi.spyOn(source, 'getClusterChildren');

    await clickMarker();

    expect(clusterClick).toHaveBeenCalledExactlyOnceWith(cluster);
    expect(getChildren).not.toHaveBeenCalled();
    expectInitialCamera();
  });

  it('descends into clusters that do not split on the next zoom level', async () => {
    create();
    const getChildren = vi
      .spyOn(source, 'getClusterChildren')
      .mockResolvedValueOnce([point([0, 0], 43)])
      .mockResolvedValueOnce([pointAt(90), pointAt(-90)]);
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();

    expect(getChildren).toHaveBeenCalledTimes(2);
    expect(getChildren).toHaveBeenLastCalledWith(43);
    expectCamera([0, 0], 6);
  });

  it('moves focus to the map canvas when the activated marker disappears', async () => {
    create();
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(90), pointAt(-90)]);
    const marker = page.getByRole('button', { name: 'Cluster with 2 locations' }).element();
    // Remove it during dispatch, before reduced motion completes the camera transition synchronously.
    marker.addEventListener(
      'click',
      () => {
        marker.remove();
      },
      { once: true }
    );
    const canvas = getMapInstance().getCanvas();
    const focus = vi.spyOn(canvas, 'focus');
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();
    await fixture.whenStable();

    expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
  });

  it('moves focus to the map when MapLibre blurs the marker during the zoom', async () => {
    create();
    vi.spyOn(source, 'getClusterChildren').mockResolvedValue([pointAt(90), pointAt(-90)]);
    const marker = page.getByRole('button', { name: 'Cluster with 2 locations' });
    const canvas = getMapInstance().getCanvas();
    const focus = vi.spyOn(canvas, 'focus');
    const waitForMoveEnd = startWaitingForMoveEnd();

    await clickMarker();
    await waitForMoveEnd();
    await fixture.whenStable();

    expect(marker).toBeInTheDocument();
    expect(canvas).toHaveFocus();
    expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
  });

  it('delegates leaf requests to its GeoJSON source', async () => {
    create();
    const getLeaves = vi.spyOn(source, 'getClusterLeaves').mockResolvedValue([cluster]);

    const leaves = await fixture.componentInstance.source().getClusterLeaves(42, 10, 20);

    expect(getLeaves).toHaveBeenCalledExactlyOnceWith(42, 10, 20);
    expect(leaves).toEqual([cluster]);
  });

  it('connects a projected popup to marker clicks through the parent source', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent, {
      bindings: [inputBinding('zoomOnClick', () => false), inputBinding('withPopover', () => true)]
    });
    hostFixture.detectChanges();
    const getLeaves = vi
      .spyOn(hostFixture.componentInstance.source(), 'getClusterLeaves')
      .mockResolvedValue([]);

    await userEvent.click(page.getByRole('button', { name: 'Cluster with 2 locations' }));
    await hostFixture.whenStable();

    expect(getLeaves).toHaveBeenCalledExactlyOnceWith(42, 8, 0);
    await expect
      .element(page.getByRole('dialog', { name: 'Cluster with 2 locations' }))
      .toBeInTheDocument();
  });
});
