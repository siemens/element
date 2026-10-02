/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterNextRender,
  Component,
  Directive,
  ElementRef,
  input,
  inputBinding,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MapService, PopupComponent } from '@maplibre/ngx-maplibre-gl';
import { Subject } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import { ClusterPoint } from './cluster-types';
import { SiClusterPopoverTemplateDirective } from './si-cluster-popover-template.directive';
import { SiClusterPopoverComponent as TestComponent } from './si-cluster-popover.component';
import { SiClusterSourceComponent } from './si-cluster-source.component';

let autoOpenPopup = true;

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
  readonly popupOpen = output<void>();
  readonly popupClose = output<void>();

  constructor() {
    afterNextRender(() => {
      if (autoOpenPopup) {
        this.popupOpen.emit();
      }
    });
  }
}

@Component({
  imports: [TestComponent, SiClusterPopoverTemplateDirective],
  template: `
    <div #mapContainer class="vh-100 w-100">
      @if (showPopover()) {
        <si-cluster-popover
          [pageSize]="pageSize()"
          [focusAfterOpen]="focusAfterOpen()"
          [closeOnMove]="closeOnMove()"
          [labelProperty]="labelProperty()"
          [descriptionProperty]="descriptionProperty()"
        >
          @if (customContent()) {
            <ng-template
              let-features
              let-loadedFeatures="features"
              let-total="total"
              let-cluster="cluster"
              let-close="close"
              siClusterPopoverTemplate
            >
              <div data-testid="custom-content">
                {{ cluster.properties?.['cluster_id'] }}:{{ features.length }}:{{ total }}
                @for (feature of loadedFeatures; track $index) {
                  <button type="button" class="d-block">
                    Select {{ feature.properties?.name }}
                  </button>
                }
                <button type="button" (click)="close()">Dismiss locations</button>
              </div>
            </ng-template>
          }
        </si-cluster-popover>
      }
    </div>
  `
})
class TestHostComponent {
  readonly pageSize = input(1);
  readonly focusAfterOpen = input(true);
  readonly closeOnMove = input(true);
  readonly labelProperty = input('name');
  readonly descriptionProperty = input('description');
  readonly customContent = input(false);
  readonly showPopover = signal(true);
  readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
}

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
const createFeatures = (count: number): ClusterPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    ...firstFeature,
    id: index,
    properties: { name: `Location ${index + 1}` }
  }));

describe('SiClusterPopoverComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let trigger: HTMLButtonElement | undefined;
  let clusterClick: ReturnType<typeof output<ClusterPoint>>;
  const pageSize = signal(1);
  const focusAfterOpen = signal(true);
  const closeOnMove = signal(true);
  const labelProperty = signal('name');
  const descriptionProperty = signal('description');
  const customContent = signal(false);
  let clusterPosition = 0.8;
  const mapMove = new Subject<void>();
  const data = signal<GeoJSON.FeatureCollection<GeoJSON.Point>>({
    type: 'FeatureCollection',
    features: []
  });
  const statusProperty = signal<string | undefined>(undefined);
  const getClusterLeaves = vi.fn<SiClusterSourceComponent['getClusterLeaves']>();

  beforeEach(async () => {
    await page.viewport(640, 600);
    autoOpenPopup = true;
    pageSize.set(1);
    focusAfterOpen.set(true);
    closeOnMove.set(true);
    labelProperty.set('name');
    descriptionProperty.set('description');
    customContent.set(false);
    clusterPosition = 0.8;
    statusProperty.set(undefined);
    getClusterLeaves.mockReset().mockResolvedValue([firstFeature]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MapService,
          useValue: {
            mapInstance: {
              getContainer: () => fixture.componentInstance.mapContainer().nativeElement,
              project: () => {
                const container = fixture.componentInstance.mapContainer().nativeElement;
                return {
                  x: container.clientWidth / 2,
                  y: container.clientHeight * clusterPosition
                };
              },
              on: (_event: string, listener: () => void) => mapMove.subscribe(listener)
            }
          }
        },
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
    fixture = TestBed.createComponent(TestHostComponent, {
      bindings: [
        inputBinding('pageSize', pageSize),
        inputBinding('focusAfterOpen', focusAfterOpen),
        inputBinding('closeOnMove', closeOnMove),
        inputBinding('labelProperty', labelProperty),
        inputBinding('descriptionProperty', descriptionProperty),
        inputBinding('customContent', customContent)
      ]
    });
    element = fixture.nativeElement;
    clusterClick = TestBed.inject(SiClusterSourceComponent).clusterClick;
    fixture.detectChanges();
  });

  afterEach(() => {
    trigger?.remove();
    trigger = undefined;
    vi.restoreAllMocks();
  });

  it('uses the visible title to label the dialog and a separate label for its scroll region', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    const dialog = page.getByRole('dialog').element();

    expect(dialog).toHaveAttribute('aria-labelledby');
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!);
    expect(title).toBeVisible();
    expect(title).toHaveTextContent('Cluster with 2 locations');
    expect(dialog).toContainElement(title);
    expect(dialog).toHaveAccessibleName('Cluster with 2 locations');
    expect(dialog).not.toHaveAttribute('aria-label');
    expect(page.getByRole('region')).toHaveAccessibleName('Cluster locations');
  });

  it('uses unique title references for multiple popovers', async () => {
    const secondFixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('pageSize', () => 1), inputBinding('focusAfterOpen', () => false)]
    });
    // TestBed removes the previous root when another fixture is created.
    document.body.append(element);
    secondFixture.detectChanges();
    clusterClick.emit(cluster);
    await fixture.whenStable();
    await secondFixture.whenStable();
    const firstDialog = element.querySelector<HTMLElement>('[role="dialog"]')!;
    const secondDialog = (secondFixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[role="dialog"]'
    )!;

    expect(firstDialog).toHaveAttribute('aria-labelledby');
    expect(secondDialog).toHaveAttribute('aria-labelledby');
    expect(secondDialog).not.toHaveAttribute(
      'aria-labelledby',
      firstDialog.getAttribute('aria-labelledby')!
    );
    expect(firstDialog).toHaveAccessibleName('Cluster with 2 locations');
    expect(secondDialog).toHaveAccessibleName('Cluster with 2 locations');
  });

  it('uses the component inputs to select default labels and descriptions', async () => {
    labelProperty.set('title');
    descriptionProperty.set('details');
    getClusterLeaves.mockResolvedValueOnce([
      {
        ...firstFeature,
        properties: {
          title: 'Location title',
          details: 'Location details',
          name: 'Location name',
          description: 'Location description'
        }
      }
    ]);
    clusterClick.emit(cluster);
    await fixture.whenStable();
    const row = page.getByRole('listitem');

    expect(row).toMatchTextContent('Location title');
    expect(row).toMatchTextContent('Location details');
    expect(row).not.toMatchTextContent('Location name');

    labelProperty.set('name');
    descriptionProperty.set('description');
    await fixture.whenStable();

    expect(row).toMatchTextContent('Location name');
    expect(row).toMatchTextContent('Location description');
    expect(row).not.toMatchTextContent('Location title');
  });

  it('initially focuses Close and preserves that focus when the first batch arrives', async () => {
    let resolveLeaves!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveLeaves = resolve)));
    clusterClick.emit(cluster);

    await expect.poll(() => page.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    resolveLeaves([firstFeature]);
    await fixture.whenStable();

    expect(page.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(page.getByRole('button', { name: 'Load more' })).not.toHaveFocus();
  });

  it.each(['attached', 'detached'])(
    'waits for popupOpen before focusing Close with %s content',
    async attachment => {
      autoOpenPopup = false;
      trigger = document.createElement('button');
      document.body.append(trigger);
      trigger.focus();
      const popover = element.querySelector('si-cluster-popover')!;
      if (attachment === 'detached') {
        popover.remove();
      }

      clusterClick.emit(cluster);
      await fixture.whenStable();

      expect(trigger).toHaveFocus();

      fixture.componentInstance.mapContainer().nativeElement.append(popover);
      const popup = fixture.debugElement.query(By.directive(TestPopupComponent))
        .componentInstance as TestPopupComponent;
      popup.popupOpen.emit();
      await fixture.whenStable();

      expect(page.getByRole('button', { name: 'Close' })).toHaveFocus();
    }
  );

  it('does not show a load more button when the first batch contains every location', async () => {
    pageSize.set(2);
    getClusterLeaves.mockResolvedValueOnce([firstFeature, secondFeature]);
    clusterClick.emit(cluster);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenCalledExactlyOnceWith(42, 2, 0);
    expect(page.getByRole('listitem')).toHaveLength(2);
    expect(page.getByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('loads and appends successive batches including a partial final batch', async () => {
    const features = createFeatures(5);
    pageSize.set(2);
    getClusterLeaves
      .mockResolvedValueOnce(features.slice(0, 2))
      .mockResolvedValueOnce(features.slice(2, 4))
      .mockResolvedValueOnce(features.slice(4));
    clusterClick.emit({ ...cluster, properties: { cluster_id: 42, point_count: 5 } });
    await fixture.whenStable();
    const firstRow = element.querySelector('.list-unstyled li');
    const loadMoreButton = page.getByRole('button', { name: 'Load more' });

    expect(getClusterLeaves).toHaveBeenCalledExactlyOnceWith(42, 2, 0);
    expect(page.getByRole('dialog', { name: 'Cluster with 5 locations' })).toBeInTheDocument();
    expect(page.getByRole('listitem')).toHaveLength(2);
    expect(element.querySelector('.list-unstyled')).toMatchTextContent('Location 1');
    expect(element.querySelector('.list-unstyled')).toMatchTextContent('Location 2');
    expect(loadMoreButton).toHaveClass('btn', 'btn-link');
    expect(element.querySelector('si-pagination')).not.toBeInTheDocument();

    await userEvent.click(loadMoreButton);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 2, 2);
    expect(page.getByRole('listitem')).toHaveLength(4);
    expect(element.querySelector('.list-unstyled')).toMatchTextContent('Location 1');
    expect(element.querySelector('.list-unstyled')).toMatchTextContent('Location 4');
    expect(loadMoreButton).toBeInTheDocument();

    await userEvent.click(loadMoreButton);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 2, 4);
    expect(page.getByRole('listitem')).toHaveLength(5);
    expect(element.querySelector('.list-unstyled li')).toBe(firstRow);
    expect(element.querySelector('.list-unstyled')).toMatchTextContent('Location 5');
    expect(loadMoreButton).not.toBeInTheDocument();
    expect(page.getByRole('region')).toHaveFocus();
  });

  it('keeps load more focused and visible when appended locations move it down the list', async () => {
    const features = createFeatures(30);
    pageSize.set(10);
    getClusterLeaves.mockResolvedValueOnce(features.slice(0, 10));
    clusterClick.emit({ ...cluster, properties: { cluster_id: 42, point_count: 30 } });
    await fixture.whenStable();
    const scroll = page.getByRole('region').element();
    scroll.scrollTop = scroll.scrollHeight;
    const scrollTop = scroll.scrollTop;
    const button = page.getByRole('button', { name: 'Load more' });
    getClusterLeaves.mockResolvedValueOnce(features.slice(10, 20));

    await userEvent.click(button);
    await fixture.whenStable();

    expect(page.getByRole('listitem')).toHaveLength(20);
    expect(scroll.scrollTop).toBeGreaterThan(scrollTop);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button.element().getBoundingClientRect().top).toBeGreaterThanOrEqual(
      scroll.getBoundingClientRect().top
    );
    expect(button.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(
      scroll.getBoundingClientRect().bottom
    );
  });

  it('keeps the rendered locations and popup height while the next batch loads under an overlay', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    const dialog = page.getByRole('dialog').element();
    const height = dialog.getBoundingClientRect().height;
    const row = element.querySelector('.list-unstyled li');
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));

    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await expect.poll(() => element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    expect(element.querySelector('.list-unstyled li')).toBe(row);
    expect(page.getByRole('status')).not.toBeInTheDocument();
    expect(dialog.getBoundingClientRect().height).toBe(height);
    await expect.poll(() => element.querySelector('.spinner-overlay')).toBeInTheDocument();
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('First location');
    expect(dialog.getBoundingClientRect().height).toBe(height);

    resolveBatch([secondFeature]);
    await fixture.whenStable();

    expect(element.querySelector('[aria-busy]')).toHaveAttribute('aria-busy', 'false');
    expect(element.querySelector('.list-unstyled')).toHaveTextContent(
      'First location Second location'
    );
    expect(element.querySelector('[inert]')).not.toBeInTheDocument();
  });

  it('ignores load more clicks while a batch is loading', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));
    const button = page.getByRole('button', { name: 'Load more' });

    await userEvent.click(button);
    await expect.poll(() => getClusterLeaves.mock.calls).toHaveLength(2);

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('disabled');
    button.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    resolveBatch([secondFeature]);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenCalledTimes(2);
    expect(page.getByRole('listitem')).toHaveLength(2);
  });

  it.each([false, true])(
    'focuses the scroll region after the last batch without closing on Enter with customContent=%s',
    async custom => {
      customContent.set(custom);
      clusterClick.emit(cluster);
      await fixture.whenStable();
      let resolveBatch!: (features: ClusterPoint[]) => void;
      getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));
      const button = page.getByRole('button', { name: 'Load more' });

      await userEvent.click(button);
      await expect.poll(() => element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

      expect(button).toHaveFocus();

      resolveBatch([secondFeature]);
      await fixture.whenStable();

      expect(page.getByRole('region')).toHaveFocus();
      expect(button).not.toBeInTheDocument();

      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();

      expect(page.getByRole('dialog')).toBeInTheDocument();
      expect(getClusterLeaves).toHaveBeenCalledTimes(2);
    }
  );

  it('does not steal focus when the user leaves load more before the last batch arrives', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));

    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await expect.poll(() => getClusterLeaves.mock.calls).toHaveLength(2);
    const closeButton = page.getByRole('button', { name: 'Close' });
    closeButton.element().focus();
    resolveBatch([secondFeature]);
    await fixture.whenStable();

    expect(closeButton).toHaveFocus();
    expect(page.getByRole('region')).not.toHaveFocus();
    expect(page.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not scroll a completed batch when focus has moved away from load more', async () => {
    pageSize.set(10);
    const features = createFeatures(30);
    getClusterLeaves.mockResolvedValueOnce(features.slice(0, 10));
    clusterClick.emit({ ...cluster, properties: { cluster_id: 42, point_count: 30 } });
    await fixture.whenStable();
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));

    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await expect.poll(() => getClusterLeaves.mock.calls).toHaveLength(2);
    const closeButton = page.getByRole('button', { name: 'Close' });
    closeButton.element().focus({ preventScroll: true });
    const scroll = page.getByRole('region').element();
    scroll.scrollTop = 0;
    resolveBatch(features.slice(10, 20));
    await fixture.whenStable();

    expect(closeButton).toHaveFocus();
    expect(scroll.scrollTop).toBe(0);
  });

  it.each([false, true])(
    'keeps a failed batch alert and retry visible at the end of a long list with customContent=%s',
    async custom => {
      customContent.set(custom);
      pageSize.set(20);
      getClusterLeaves.mockResolvedValueOnce(createFeatures(20));
      clusterClick.emit({ ...cluster, properties: { cluster_id: 42, point_count: 30 } });
      await fixture.whenStable();
      const scroll = page.getByRole('region').element();
      scroll.scrollTop = scroll.scrollHeight;
      getClusterLeaves.mockRejectedValueOnce(new Error('Source unavailable'));

      await userEvent.click(page.getByRole('button', { name: 'Load more' }));
      await fixture.whenStable();

      const alert = page.getByRole('alert').element();
      const retry = page.getByRole('button', { name: 'Retry' });
      const bounds = scroll.getBoundingClientRect();
      expect(alert.getBoundingClientRect().top).toBeGreaterThanOrEqual(bounds.top);
      expect(alert.getBoundingClientRect().bottom).toBeLessThanOrEqual(bounds.bottom);
      expect(retry.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(bounds.bottom);
      expect(retry).toHaveFocus();
    }
  );

  it.each(['switch', 'reopen'])('resets locations and offset on cluster %s', async action => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    getClusterLeaves.mockResolvedValueOnce([secondFeature]);
    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await fixture.whenStable();

    if (action === 'reopen') {
      await userEvent.click(page.getByRole('button', { name: 'Close' }));
      await fixture.whenStable();
    }
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));
    clusterClick.emit(
      action === 'reopen' ? cluster : { ...cluster, properties: { cluster_id: 43, point_count: 2 } }
    );
    await expect.poll(() => element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(action === 'reopen' ? 42 : 43, 1, 0);
    expect(page.getByRole('listitem')).toHaveLength(0);

    resolveBatch([firstFeature]);
    await fixture.whenStable();

    expect(page.getByRole('listitem')).toHaveLength(1);
    expect(element.querySelector('.list-unstyled')).toHaveTextContent('First location');
    expect(element.querySelector('.list-unstyled')).not.toHaveTextContent('Second location');
    expect(page.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });

  it('resets the loaded locations and offset when the batch size changes', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    getClusterLeaves.mockResolvedValueOnce([secondFeature]);
    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await fixture.whenStable();

    getClusterLeaves.mockResolvedValueOnce([firstFeature, secondFeature]);
    pageSize.set(2);
    await fixture.whenStable();

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 2, 0);
    expect(page.getByRole('listitem')).toHaveLength(2);
    expect(page.getByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('clears retained locations and ignores an outstanding batch when the batch size changes', async () => {
    clusterClick.emit(cluster);
    await fixture.whenStable();
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));
    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await expect.poll(() => getClusterLeaves.mock.calls).toHaveLength(2);

    let resolveInitial!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveInitial = resolve)));
    pageSize.set(2);
    await expect.poll(() => getClusterLeaves.mock.calls).toHaveLength(3);

    expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 2, 0);
    expect(page.getByRole('listitem')).toHaveLength(0);

    resolveInitial([firstFeature, secondFeature]);
    await fixture.whenStable();
    resolveBatch([secondFeature]);
    await fixture.whenStable();

    expect(page.getByRole('listitem')).toHaveLength(2);
    expect(page.getByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('ignores a stale response after switching clusters', async () => {
    let resolveFirst!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveFirst = resolve)));
    clusterClick.emit(cluster);
    fixture.detectChanges();

    expect(element.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    getClusterLeaves.mockResolvedValue([secondFeature]);
    clusterClick.emit({ ...cluster, properties: { cluster_id: 43, point_count: 2 } });
    await fixture.whenStable();
    resolveFirst([firstFeature]);
    await fixture.whenStable();

    expect(element.querySelector('.list-unstyled')).toHaveTextContent('Second location');
    expect(element.querySelector('.list-unstyled')).not.toHaveTextContent('First location');
  });

  it.each(['close', 'destroy'])('ignores outstanding requests after %s', async action => {
    let resolveLeaves!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveLeaves = resolve)));
    clusterClick.emit(cluster);
    await expect.poll(() => page.getByRole('button', { name: 'Close' })).toHaveFocus();

    if (action === 'close') {
      await userEvent.click(page.getByRole('button', { name: 'Close' }));
    } else {
      fixture.componentInstance.showPopover.set(false);
    }
    await expect.poll(() => page.getByRole('dialog')).not.toBeInTheDocument();

    resolveLeaves([firstFeature]);
    await fixture.whenStable();

    expect(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(getClusterLeaves).toHaveBeenCalledOnce();
  });

  it.each([false, true])(
    'keeps retry focused and ignores duplicate clicks while retrying the first batch with customContent=%s',
    async custom => {
      customContent.set(custom);
      getClusterLeaves.mockRejectedValueOnce(new Error('Source unavailable'));
      clusterClick.emit(cluster);
      await fixture.whenStable();
      const button = page.getByRole('button', { name: 'Retry' }).element();
      let resolveLeaves!: (features: ClusterPoint[]) => void;
      getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveLeaves = resolve)));

      await userEvent.click(button);
      await expect.poll(() => getClusterLeaves.mock.calls).toHaveLength(2);

      expect(button).toHaveFocus();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button.closest('[inert]')).not.toBeInTheDocument();
      expect(page.getByRole('status')).not.toBeInTheDocument();
      expect(page.getByRole('alert')).not.toBeInTheDocument();
      expect(page.getByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      resolveLeaves([firstFeature]);
      await fixture.whenStable();

      expect(getClusterLeaves).toHaveBeenCalledTimes(2);
      expect(getClusterLeaves).toHaveBeenLastCalledWith(42, 1, 0);
      expect(page.getByRole('alert')).not.toBeInTheDocument();
      expect(page.getByRole('region')).toMatchTextContent('First location');
      expect(page.getByRole('button', { name: 'Load more' }).element()).toBe(button);
      expect(button).toHaveFocus();
    }
  );

  it.each([false, true])(
    'focuses the scroll region when a first-batch retry loads every location with customContent=%s',
    async custom => {
      customContent.set(custom);
      pageSize.set(2);
      getClusterLeaves.mockRejectedValueOnce(new Error('Source unavailable'));
      clusterClick.emit(cluster);
      await fixture.whenStable();
      getClusterLeaves.mockResolvedValueOnce([firstFeature, secondFeature]);

      await userEvent.click(page.getByRole('button', { name: 'Retry' }));
      await fixture.whenStable();

      expect(page.getByRole('region')).toHaveFocus();
      expect(page.getByRole('alert')).not.toBeInTheDocument();
      expect(page.getByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
      expect(page.getByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    }
  );

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

  it('renders projected content and makes its retained actions inert while loading more', async () => {
    customContent.set(true);
    clusterClick.emit(cluster);
    await fixture.whenStable();

    expect(page.getByTestId('custom-content')).toMatchTextContent('42:1:2');
    expect(page.getByRole('button', { name: 'Close' })).toHaveFocus();

    const action = element.querySelector<HTMLButtonElement>(
      '[data-testid="custom-content"] button'
    )!;
    let resolveBatch!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveBatch = resolve)));

    await userEvent.click(page.getByRole('button', { name: 'Load more' }));
    await expect.poll(() => action.closest('[inert]')).toBeInTheDocument();

    expect(action).toHaveTextContent('Select First location');
    action.focus();
    expect(action).not.toHaveFocus();
    expect(
      page.getByRole('button', { name: 'Load more' }).element().closest('[inert]')
    ).not.toBeInTheDocument();

    resolveBatch([secondFeature]);
    await fixture.whenStable();

    expect(page.getByTestId('custom-content')).toMatchTextContent('42:2:2');
    expect(element.querySelector('[data-testid="custom-content"] button')).toBe(action);
    const newAction = page.getByRole('button', { name: 'Select Second location' }).element();
    expect(newAction).toHaveTextContent('Select Second location');
    newAction.focus();
    expect(newAction).toHaveFocus();
  });

  it('closes through the callback exposed to the custom template', async () => {
    customContent.set(true);
    clusterClick.emit(cluster);
    await fixture.whenStable();

    await userEvent.click(page.getByRole('button', { name: 'Dismiss locations' }));
    await fixture.whenStable();

    expect(page.getByRole('dialog')).not.toBeInTheDocument();
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

  it.each(['escape', 'close', 'destroy'])(
    'closes and restores focus to the trigger on %s',
    async action => {
      trigger = document.createElement('button');
      document.body.append(trigger);
      trigger.focus();
      clusterClick.emit(cluster);
      await fixture.whenStable();

      expect(page.getByRole('button', { name: 'Close' })).toHaveFocus();

      if (action === 'escape') {
        await userEvent.keyboard('{Escape}');
      } else if (action === 'close') {
        await userEvent.click(page.getByRole('button', { name: 'Close' }));
      } else {
        fixture.componentInstance.showPopover.set(false);
      }
      await fixture.whenStable();

      expect(page.getByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    }
  );

  it('unsubscribes when destroyed while the source remains alive', async () => {
    fixture.componentInstance.showPopover.set(false);
    await fixture.whenStable();

    clusterClick.emit(cluster);
    await fixture.whenStable();

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

    const loadMoreButton = page.getByRole('button', { name: 'Load more' });
    startAnchor.focus();
    await fixture.whenStable();
    expect(loadMoreButton).toHaveFocus();
  });

  it('does not capture focus when focusAfterOpen=false', async () => {
    focusAfterOpen.set(false);
    pageSize.set(2);
    let resolveLeaves!: (features: ClusterPoint[]) => void;
    getClusterLeaves.mockReturnValueOnce(new Promise(resolve => (resolveLeaves = resolve)));
    clusterClick.emit(cluster);
    await expect.poll(() => element.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(document.body).toHaveFocus();

    resolveLeaves([firstFeature, secondFeature]);
    await fixture.whenStable();

    expect(page.getByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });
});
