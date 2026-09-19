/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
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
  TemplateRef,
  viewChild
} from '@angular/core';
import { PopupComponent } from '@maplibre/ngx-maplibre-gl';
import { elementCancel } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { ClusterPoint, ClusterPopoverContext } from './cluster-types';
import { SiMaplibreClusterPopoverDirective } from './si-cluster-popover.directive';
import { SiClusterSourceComponent } from './si-cluster-source.component';

/**
 * Optional paginated popup projected into a `si-cluster-source`.
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
    SiPaginationComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-cluster-popover.component.html',
  styleUrl: './si-cluster-popover.component.scss'
})
export class SiMaplibreClusterPopoverComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly source = inject(SiClusterSourceComponent);
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
   * Number of locations displayed per page.
   * @defaultValue 8
   */
  readonly pageSize = input(8, { transform: numberAttribute });
  /**
   * Feature property displayed in the default list.
   * @defaultValue 'name'
   */
  readonly featureLabelProperty = input('name');

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
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
  protected readonly currentPage = linkedSignal(() => {
    this.selectedCluster();
    this.pageSize();
    return 1;
  });
  protected readonly leaves = resource({
    params: () => {
      const cluster = this.selectedCluster();
      return cluster
        ? {
            cluster,
            limit: this.pageSize(),
            offset: (this.currentPage() - 1) * this.pageSize()
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
  private readonly displayedFeatures = linkedSignal({
    source: () => ({
      cluster: this.selectedCluster(),
      features: this.leaves.hasValue() ? this.leaves.value() : undefined
    }),
    computation: (current, previous): ClusterPoint[] => {
      if (!current.cluster) {
        return [];
      }

      return (
        current.features ?? (current.cluster === previous?.source.cluster ? previous.value : [])
      );
    }
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
      featureLabelProperty: this.featureLabelProperty(),
      close: this.close
    };
  });

  protected readonly template = contentChild<
    SiMaplibreClusterPopoverDirective,
    TemplateRef<ClusterPopoverContext>
  >(SiMaplibreClusterPopoverDirective, { read: TemplateRef });
  protected readonly clusterPopoverTitle = t(
    () => $localize`:@@SI_MAP_CLUSTER.POPOVER_TITLE:Cluster with {{count}} locations`
  );
  protected readonly loadingText = t(
    () => $localize`:@@SI_MAP_CLUSTER.LOADING:Loading locations...`
  );
  protected readonly errorText = t(
    () => $localize`:@@SI_MAP_CLUSTER.ERROR:Could not load locations.`
  );
  protected readonly retryText = t(() => $localize`:@@SI_MAP_CLUSTER.RETRY:Retry`);
  protected readonly closeText = t(() => $localize`:@@SI_MAP_CLUSTER.CLOSE:Close`);
  protected readonly icons = addIcons({ elementCancel });
  protected readonly close = (): void => this.selectedCluster.set(undefined);

  constructor() {
    const subscription = this.source.clusterClick.subscribe(cluster => {
      this.selectedCluster.set(cluster);
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());

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
