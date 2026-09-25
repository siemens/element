/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  input,
  inputBinding,
  outputBinding,
  TemplateRef,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ClusterPointDirective,
  GeoJSONSourceComponent,
  MapService,
  MarkersForClustersComponent
} from '@maplibre/ngx-maplibre-gl';
import { NEVER } from 'rxjs';

import { ClusterPoint } from './cluster-types';
import { SiMaplibreClusterPopoverComponent } from './si-cluster-popover.component';
import { SiClusterSourceComponent as TestComponent } from './si-cluster-source.component';

const cluster: ClusterPoint = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [8, 47] },
  properties: { cluster_id: 42, point_count: 2 }
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'mgl-markers-for-clusters',
  imports: [NgTemplateOutlet],
  template:
    '<ng-container [ngTemplateOutlet]="template()" [ngTemplateOutletContext]="{ $implicit: cluster }" />'
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
  imports: [TestComponent, SiMaplibreClusterPopoverComponent],
  template: '<si-cluster-source sourceId="locations"><si-cluster-popover /></si-cluster-source>'
})
class TestHostComponent {
  readonly source = viewChild.required(TestComponent);
}

describe('SiClusterSourceComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  const clusterClick = vi.fn();

  beforeEach(() => {
    clusterClick.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: MapService, useValue: { mapLoaded$: NEVER } }]
    });
    TestBed.overrideComponent(TestComponent, {
      remove: { imports: [MarkersForClustersComponent] },
      add: { imports: [TestMarkersComponent] }
    });
    TestBed.overrideComponent(SiMaplibreClusterPopoverComponent, {
      set: { imports: [], template: '@if (context(); as context) { <p>{{ context.total }}</p> }' }
    });
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('sourceId', () => 'locations'),
        outputBinding('clusterClick', clusterClick)
      ]
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits marker clicks without loading leaves when no popup is projected', async () => {
    const source = fixture.debugElement.query(By.directive(GeoJSONSourceComponent))
      .componentInstance as GeoJSONSourceComponent;
    const getLeaves = vi.spyOn(source, 'getClusterLeaves');

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(clusterClick).toHaveBeenCalledExactlyOnceWith(cluster);
    expect(getLeaves).not.toHaveBeenCalled();
  });

  it('delegates leaf requests to its GeoJSON source', async () => {
    const source = fixture.debugElement.query(By.directive(GeoJSONSourceComponent))
      .componentInstance as GeoJSONSourceComponent;
    const getLeaves = vi.spyOn(source, 'getClusterLeaves').mockResolvedValue([cluster]);

    const leaves = await component.getClusterLeaves(42, 10, 20);

    expect(getLeaves).toHaveBeenCalledExactlyOnceWith(42, 10, 20);
    expect(leaves).toEqual([cluster]);
  });

  it('connects a projected popup to marker clicks through the parent source', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const getLeaves = vi
      .spyOn(hostFixture.componentInstance.source(), 'getClusterLeaves')
      .mockResolvedValue([]);

    hostFixture.nativeElement.querySelector('button').click();
    await hostFixture.whenStable();

    expect(getLeaves).toHaveBeenCalledExactlyOnceWith(42, 8, 0);
    expect(hostFixture.nativeElement.querySelector('si-cluster-popover p')).toHaveTextContent('2');
  });
});
