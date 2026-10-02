/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  resource,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import { MapService, PopupComponent } from '@maplibre/ngx-maplibre-gl';
import { elementCancel } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { ClusterPoint, ClusterPopoverContext } from './cluster-types';
import { SiClusterPopoverTemplateDirective } from './si-cluster-popover-template.directive';
import { SiClusterSourceComponent } from './si-cluster-source.component';

/**
 * Optional popup with incrementally loaded locations projected into a `si-cluster-source`.
 *
 * @experimental
 */
@Component({
  selector: 'si-cluster-popover',
  imports: [
    CdkTrapFocus,
    NgTemplateOutlet,
    PopupComponent,
    SiIconComponent,
    SiLoadingSpinnerDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-cluster-popover.component.html',
  styleUrl: './si-cluster-popover.component.scss'
})
export class SiClusterPopoverComponent {
  private static idCounter = 0;

  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly source = inject(SiClusterSourceComponent);
  private readonly mapService = inject(MapService);
  private readonly resizeObserver = inject(ResizeObserverService);
  /**
   * Maximum width passed to the MapLibre popup.
   * @defaultValue '320px'
   */
  readonly maxWidth = input('320px');
  /**
   * Whether the popup closes when the map moves.
   * @defaultValue true
   */
  readonly closeOnMove = input(true, { transform: booleanAttribute });
  /**
   * Whether the popup receives focus after opening.
   * @defaultValue true
   */
  readonly focusAfterOpen = input(true, { transform: booleanAttribute });
  /**
   * Number of locations loaded initially and with each "Load more" action.
   * @defaultValue 8
   */
  readonly pageSize = input(8, { transform: numberAttribute });
  /**
   * Feature property displayed in the default list.
   * @defaultValue 'name'
   */
  readonly labelProperty = input('name');
  /**
   * Feature property displayed as the description in the default list.
   * @defaultValue 'description'
   */
  readonly descriptionProperty = input('description');

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  private readonly scrollRegion = viewChild<ElementRef<HTMLDivElement>>('scrollRegion');
  private readonly focusTrap = viewChild(CdkTrapFocus);
  private readonly batchButton = viewChild<ElementRef<HTMLButtonElement>>('batchButton');
  private readonly selectedCluster = linkedSignal<ClusterPoint | undefined>(() => {
    this.source.sourceId();
    this.source.data();
    this.source.groupProperty();
    this.source.groupColors();
    this.source.statusProperty();
    this.source.clusterRadius();
    this.source.clusterMaxZoom();
    this.source.clusterMinPoints();
    return undefined;
  });
  private readonly batchFocusRequested = linkedSignal(() => {
    this.selectedCluster();
    this.pageSize();
    return false;
  });
  private readonly offset = linkedSignal(() => {
    this.selectedCluster();
    this.pageSize();
    return 0;
  });
  private readonly displayedFeatures = linkedSignal({
    source: () => ({
      cluster: this.selectedCluster(),
      limit: this.pageSize(),
      offset: this.offset(),
      features: this.leaves.hasValue() ? this.leaves.value() : undefined
    }),
    computation: (current, previous): ClusterPoint[] => {
      if (!current.cluster) {
        return [];
      }

      const retainedFeatures =
        current.cluster === previous?.source.cluster && current.limit === previous.source.limit
          ? previous.value
          : [];
      return current.features
        ? [...retainedFeatures.slice(0, current.offset), ...current.features]
        : retainedFeatures;
    }
  });

  protected readonly titleId = `__si-cluster-popover-title-${SiClusterPopoverComponent.idCounter++}`;
  protected readonly popupCoordinates = linkedSignal(
    () => this.selectedCluster()?.geometry.coordinates
  );
  protected readonly availableBlockSize = signal<number | undefined>(undefined);
  protected readonly leaves = resource({
    params: () => {
      const cluster = this.selectedCluster();
      return cluster
        ? {
            cluster,
            limit: this.pageSize(),
            offset: this.offset()
          }
        : undefined;
    },
    loader: ({ params }) =>
      this.source.getClusterLeaves(
        Number(params.cluster.properties?.cluster_id),
        params.limit,
        params.offset
      )
  });
  protected readonly context = computed<ClusterPopoverContext | undefined>(() => {
    const features = this.displayedFeatures();
    const cluster = this.selectedCluster();
    if (!cluster) {
      return undefined;
    }

    return {
      $implicit: features,
      features,
      total: Number(cluster.properties?.point_count),
      loading: this.leaves.isLoading(),
      error: this.leaves.error(),
      cluster,
      close: this.close
    };
  });

  protected readonly template = contentChild<
    SiClusterPopoverTemplateDirective,
    TemplateRef<ClusterPopoverContext>
  >(SiClusterPopoverTemplateDirective, { read: TemplateRef });
  protected readonly clusterPopoverTitle = t(
    () => $localize`:@@SI_MAP_CLUSTER.POPOVER_TITLE:Cluster with {{count}} locations`
  );
  protected readonly locationsLabel = t(
    () => $localize`:@@SI_MAP_CLUSTER.LOCATIONS:Cluster locations`
  );
  protected readonly errorText = t(
    () => $localize`:@@SI_MAP_CLUSTER.ERROR:Could not load locations.`
  );
  protected readonly loadMoreText = t(() => $localize`:@@SI_MAP_CLUSTER.LOAD_MORE:Load more`);
  protected readonly retryText = t(() => $localize`:@@SI_MAP_CLUSTER.RETRY:Retry`);
  protected readonly closeText = t(() => $localize`:@@SI_MAP_CLUSTER.CLOSE:Close`);
  protected readonly icons = addIcons({ elementCancel });
  protected readonly onPopupOpen = (): void => {
    // CDK auto-capture runs before MapLibre attaches the popup content.
    if (this.focusAfterOpen()) {
      this.focusTrap()?.focusTrap?.focusInitialElement({ preventScroll: true });
    }
  };
  protected readonly close = (): void => this.selectedCluster.set(undefined);
  protected readonly loadBatch = (): void => {
    if (this.leaves.isLoading()) {
      return;
    }

    // Safari does not focus buttons on click.
    this.batchButton()?.nativeElement.focus({ preventScroll: true });
    this.batchFocusRequested.set(true);
    if (this.leaves.error()) {
      this.leaves.reload();
    } else {
      this.offset.set(this.displayedFeatures().length);
    }
  };

  constructor() {
    const subscription = this.source.clusterClick.subscribe(cluster => {
      this.selectedCluster.set(cluster);
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());

    effect(onCleanup => {
      const dialog = this.dialog()?.nativeElement;
      const cluster = this.selectedCluster();
      if (!dialog || !cluster) {
        return;
      }

      const map = this.mapService.mapInstance;
      const mapContainer = map.getContainer();
      const updateAvailableSpace = (): void => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { y } = map.project([longitude, latitude]);
        const height = mapContainer.clientHeight;
        this.availableBlockSize.set(Math.min(height, Math.max(y, height - y)));
      };
      updateAvailableSpace();

      const mapResizeSubscription = this.resizeObserver
        .observe(mapContainer, 0)
        .subscribe(updateAvailableSpace);
      const dialogResizeSubscription = this.resizeObserver.observe(dialog, 0).subscribe(() => {
        // A new coordinate reference refreshes MapLibre's popup anchor.
        this.popupCoordinates.update(coordinates => (coordinates ? [...coordinates] : undefined));
      });
      const moveSubscription = map.on('move', updateAvailableSpace);
      onCleanup(() => {
        mapResizeSubscription.unsubscribe();
        dialogResizeSubscription.unsubscribe();
        moveSubscription.unsubscribe();
      });
    });

    afterRenderEffect({
      earlyRead: () => {
        if (!this.batchFocusRequested()) {
          return undefined;
        }

        const loading = this.leaves.isLoading();
        const button = this.batchButton()?.nativeElement;
        const active = this.document.activeElement;
        return {
          loading,
          button: active === button ? button : undefined,
          scrollRegion:
            !button && active === this.document.body
              ? this.scrollRegion()?.nativeElement
              : undefined
        };
      },
      write: state => {
        const request = state();
        if (!request || request.loading) {
          return;
        }

        this.batchFocusRequested.set(false);
        if (request.button) {
          request.button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
          request.scrollRegion?.focus({ preventScroll: true });
        }
      }
    });

    effect(onCleanup => {
      if (!this.selectedCluster()) {
        return;
      }

      const trigger = this.document.activeElement;
      onCleanup(() => {
        const active = this.document.activeElement;
        if (
          trigger instanceof HTMLElement &&
          trigger.isConnected &&
          (active === this.document.body || this.dialog()?.nativeElement.contains(active))
        ) {
          trigger.focus();
        }
      });
    });
  }
}
