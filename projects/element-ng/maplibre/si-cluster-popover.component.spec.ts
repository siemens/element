/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, Directive, input, inputBinding, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PopupComponent } from '@maplibre/ngx-maplibre-gl';
import { page, userEvent } from 'vitest/browser';

import { ClusterPoint } from './cluster-types';
import { SiMaplibreClusterPopoverComponent as TestComponent } from './si-cluster-popover.component';
import { SiMaplibreClusterPopoverDirective } from './si-cluster-popover.directive';
import { SiClusterSourceComponent } from './si-cluster-source.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'mgl-popup',
  template: '<ng-content />'
})
class TestPopupComponent {
  readonly maxWidth = input<string>();
  readonly lngLat = input<unknown>();
  readonly closeOnMove = input<boolean>();
  readonly focusAfterOpen = input<boolean>();
  readonly closeButton = input<boolean>();
  readonly popupClose = output<void>();
}

@Component({
  imports: [TestComponent, SiMaplibreClusterPopoverDirective],
  template: `
    <si-cluster-popover [pageSize]="1">
      <ng-template let-features let-total="total" let-cluster="cluster" siMaplibreClusterPopover>
        <div data-testid="custom-content">
          {{ cluster.properties?.['cluster_id'] }}:{{ features.length }}:{{ total }}
          @for (feature of features; track $index) {
            <button type="button">Select {{ feature.properties?.name }}</button>
          }
        </div>
      </ng-template>
    </si-cluster-popover>
  `
})
class TestHostComponent {}

@Directive()
class TestSource {
  readonly clusterClick = output<ClusterPoint>();
}

const cluster: ClusterPoint = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [8, 47] },
  properties: { cluster_id: 42, point_count: 2 }
};
const firstFeature: ClusterPoint = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [8.1, 47.1] },
  properties: { name: 'First location' }
};
const secondFeature: ClusterPoint = {
  ...firstFeature,
  properties: { name: 'Second location' }
};

describe('SiMaplibreClusterPopoverComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let clusterClick: ReturnType<typeof output<ClusterPoint>>;
  const pageSize = signal(1);
  const focusAfterOpen = signal(true);
  const data = signal<GeoJSON.FeatureCollection<GeoJSON.Point>>({
    type: 'FeatureCollection',
    features: []
  });
  const statusProperty = signal<string | undefined>(undefined);
  const getClusterLeaves = vi.fn<SiClusterSourceComponent['getClusterLeaves']>();

  beforeEach(() => {
    pageSize.set(1);
    focusAfterOpen.set(true);
    statusProperty.set(undefined);
    getClusterLeaves.mockReset().mockResolvedValue([firstFeature]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SiClusterSourceComponent,
          useFactory: () => ({
            clusterClick: new TestSource().clusterClick,
            getClusterLeaves,
            data,
            statusProperty,
            sourceId: signal('locations'),
            groupProperty: signal('group'),
            groupColors: signal('status'),
            clusterRadius: signal(50),
            clusterMaxZoom: signal(undefined),
            clusterMinPoints: signal(2)
          })
        }
      ]
    });
    TestBed.overrideComponent(TestComponent, {
      remove: { imports: [PopupComponent] },
      add: { imports: [TestPopupComponent] }
    });
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('pageSize', pageSize), inputBinding('focusAfterOpen', focusAfterOpen)]
    });
    element = fixture.nativeElement;
    clusterClick = TestBed.inject(SiClusterSourceComponent).clusterClick;
    fixture.detectChanges();
  });

  it('does not render or fetch until a cluster is selected', () => {
    expect(element.querySelector('mgl-popup')).not.toBeInTheDocument();
    expect(getClusterLeaves).not.toHaveBeenCalled();
  });

  it('loads only the requested page and replaces its contents when navigating', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenCalledExactlyOnceWith(42, 1, 0);

    expect(page.getByRole('dialog', { name: 'Cluster with 2 locations' })).toBeInTheDocument();
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('First location');

    getClusterLeaves.mockResolvedValue([secondFeature]);
    await userEvent.click(page.getByRole('button', { name: 'Forward' }));
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 1, 1);
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('Second location');
    expect(element.querySelector('.list-unstyled')).not.toHaveTextContent('First location');
  });

  it('keeps the rendered page and popup height while the next page loads under an overlay', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    const dialog = page.getByRole('dialog').element();
    const height = dialog.getBoundingClientRect().height;
    const row = element.querySelector('.list-unstyled li');
    let resolvePage!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolvePage = resolve)));

    await userEvent.click(page.getByRole('button', { name: 'Forward' }));
    await expect.poll(() => element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    expect(element.querySelector('.list-unstyled li')).toBe(row);
    expect(dialog.getBoundingClientRect().height).toBe(height);
    await expect.poll(() => element.querySelector('.spinner-overlay')).toBeInTheDocument();
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('First location');
    expect(dialog.getBoundingClientRect().height).toBe(height);

    resolvePage([secondFeature]);
    await fixture.whenStable();

    expect(element.querySelector('[aria-busy]')).toHaveAttribute('aria-busy', 'false');
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('Second location');
    expect(element.querySelector('[inert]')).not.toBeInTheDocument();
  });

  it('keeps the last successful page on error and replaces it after retrying', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    getClusterLeaves.mockRejectedValueOnce(new Error('Source unavailable'));

    await userEvent.click(page.getByRole('button', { name: 'Forward' }));
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')).toHaveTextContent('Could not load locations.');
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('First location');

    getClusterLeaves.mockResolvedValueOnce([secondFeature]);
    await userEvent.click(page.getByRole('button', { name: 'Retry' }));
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 1, 1);
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('Second location');
    expect(element.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });

  it.each(['switch', 'reopen'])('clears retained features on cluster %s', async action => {
    clusterClick.emit(cluster);
    await fixture.whenStable();

    if (action === 'reopen') {
      await userEvent.click(page.getByRole('button', { name: 'Close' }));
      await fixture.whenStable();
    }
    let resolvePage!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolvePage = resolve)));
    clusterClick.emit(
      action === 'reopen' ? cluster : { ...cluster, properties: { cluster_id: 43, point_count: 2 } }
    );
    await expect.poll(() => element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    expect(element.querySelector('.list-unstyled')).not.toHaveTextContent('First location');

    resolvePage([secondFeature]);
    await fixture.whenStable();
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('Second location');
  });

  it('resets pagination when another cluster is selected', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Forward' }));
    await fixture.whenStable();

    clusterClick.emit({ ...cluster, properties: { cluster_id: 43, point_count: 2 } });
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(43, 1, 0);
    expect(element.querySelector('[aria-current="page"]')).toHaveTextContent('1');
  });

  it('resets pagination when the page size changes', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    await userEvent.click(page.getByRole('button', { name: 'Forward' }));

    pageSize.set(2);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 2, 0);
    expect(element.querySelector('si-pagination')).not.toBeInTheDocument();
  });

  it('shows a loading indicator and ignores a stale response after switching clusters', async () => {
    let resolveFirst!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveFirst = resolve)));
    clusterClick.emit(cluster);
    fixture.detectChanges();

    expect(element.querySelector('[aria-busy="true"]')).toHaveTextContent('Loading locations...');

    getClusterLeaves.mockResolvedValue([secondFeature]);
    clusterClick.emit({ ...cluster, properties: { cluster_id: 43, point_count: 2 } });
    await fixture.whenStable();
    resolveFirst([firstFeature]);
    await fixture.whenStable();

    expect(element.querySelector('.list-unstyled')).toHaveTextContent('Second location');
    expect(element.querySelector('.list-unstyled')).not.toHaveTextContent('First location');
  });

  it('keeps the popup closed when an outstanding request completes', async () => {
    let resolveLeaves!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveLeaves = resolve)));
    clusterClick.emit(cluster);
    fixture.detectChanges();
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await expect.poll(() => element.querySelector('mgl-popup')).not.toBeInTheDocument();
    resolveLeaves([firstFeature]);
    await fixture.whenStable();

    expect(element.querySelector('mgl-popup')).not.toBeInTheDocument();
  });

  it('shows request errors and allows retrying the same page', async () => {
    getClusterLeaves.mockRejectedValueOnce(new Error('Source unavailable'));
    clusterClick.emit(cluster);
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')).toHaveTextContent('Could not load locations.');
    await userEvent.click(page.getByRole('button', { name: 'Retry' }));
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')).not.toBeInTheDocument();
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('First location');
  });

  it.each(['data', 'statusProperty'])('closes when source %s changes', async property => {
    clusterClick.emit(cluster);
    await fixture.whenStable();

    if (property === 'data') {
      data.set({ type: 'FeatureCollection', features: [secondFeature] });
    } else {
      statusProperty.set('status');
    }
    await fixture.whenStable();

    expect(element.querySelector('mgl-popup')).not.toBeInTheDocument();
    expect(getClusterLeaves).toHaveBeenCalledOnce();
  });

  it('preserves geometry exposed by a feature getter', async () => {
    const feature = Object.create({
      get geometry() {
        return cluster.geometry;
      }
    }) as ClusterPoint;
    feature.type = 'Feature';
    feature.properties = cluster.properties;
    clusterClick.emit(feature);
    await fixture.whenStable();

    const popup = fixture.debugElement.query(By.directive(TestPopupComponent))
      .componentInstance as TestPopupComponent;
    expect(popup.lngLat()).toEqual([8, 47]);
  });

  it('renders projected content with the current page context', async () => {
    fixture.destroy();
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    clusterClick.emit(cluster);
    await hostFixture.whenStable();

    expect(
      hostFixture.nativeElement.querySelector('[data-testid="custom-content"]')
    ).toHaveTextContent('42:1:2');
  });

  it('retains custom actions but makes them inert while another page loads', async () => {
    fixture.destroy();
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    clusterClick.emit(cluster);
    await hostFixture.whenStable();
    const hostElement: HTMLElement = hostFixture.nativeElement;
    const action = hostElement.querySelector<HTMLButtonElement>(
      '[data-testid="custom-content"] button'
    )!;
    let resolvePage!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolvePage = resolve)));

    await userEvent.click(page.getByRole('button', { name: 'Forward' }));
    await expect.poll(() => action.closest('[inert]')).toBeInTheDocument();

    expect(action).toHaveTextContent('Select First location');
    action.focus();
    expect(action).not.toHaveFocus();
    expect(hostElement.querySelector('si-pagination')!.closest('[inert]')).toBeNull();

    resolvePage([secondFeature]);
    await hostFixture.whenStable();

    const newAction = hostElement.querySelector<HTMLButtonElement>(
      '[data-testid="custom-content"] button'
    )!;
    expect(newAction).toHaveTextContent('Select Second location');
    newAction.focus();
    expect(newAction).toHaveFocus();
  });

  it('closes when MapLibre emits popupClose', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    const popup = fixture.debugElement.query(By.directive(TestPopupComponent))
      .componentInstance as TestPopupComponent;

    popup.popupClose.emit();
    await fixture.whenStable();

    expect(element.querySelector('mgl-popup')).not.toBeInTheDocument();
  });

  it('closes with Escape and restores focus to the trigger', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    clusterClick.emit(cluster);
    await fixture.whenStable();
    const close = element.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!;
    close.focus();

    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(element.querySelector('mgl-popup')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('unsubscribes when destroyed while the source remains alive', () => {
    fixture.destroy();

    clusterClick.emit(cluster);

    expect(getClusterLeaves).not.toHaveBeenCalled();
  });

  it('traps tab focus within the popover', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();

    const closeButton = page.getByRole('button', { name: 'Close' });
    const anchors = element.querySelectorAll<HTMLElement>('.cdk-focus-trap-anchor');
    const startAnchor = anchors[0];
    const endAnchor = anchors[1];

    endAnchor.focus();
    await fixture.whenStable();
    expect(closeButton).toHaveFocus();

    const forwardButton = page.getByRole('button', { name: 'Forward' });
    startAnchor.focus();
    await fixture.whenStable();
    expect(forwardButton).toHaveFocus();
  });

  it('respects focusAfterOpen=false for focus auto-capture', async () => {
    focusAfterOpen.set(false);
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();

    clusterClick.emit(cluster);
    await fixture.whenStable();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('settles an outstanding request after destruction without starting another', async () => {
    let resolveLeaves!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveLeaves = resolve)));
    clusterClick.emit(cluster);
    fixture.detectChanges();

    fixture.destroy();
    resolveLeaves([firstFeature]);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenCalledOnce();
  });
});
