/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  model,
  signal,
  untracked,
  viewChildren
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TreeItem } from '@siemens/element-ng/tree-view';
import { BehaviorSubject, switchMap } from 'rxjs';

import { BackendService } from '../backend.service';
import { FilterModel } from '../filter.model';
import { TreeFilterComponent, TreeFilterSelection } from './tree-filter.component';

const toTreeItem = (label: string, customData: any): TreeItem => ({
  label,
  selectable: true,
  state: 'leaf',
  checked: 'unchecked',
  customData
});

@Component({
  selector: 'app-filter-side-panel',
  imports: [TreeFilterComponent],
  template: `
    <div class="d-flex flex-column h-100">
      <div class="flex-grow-1">
        <app-tree-filter
          name="states"
          label="Status"
          [items]="stateItems()"
          (selectionChange)="treeModelChange('states', $event)"
        />
        <app-tree-filter
          name="versions"
          label="Version"
          [filter]="filterVersion"
          [items]="versionItems()"
          [loadMore]="versionsComplete()"
          [loading]="versionsPending()"
          (selectionChange)="treeModelChange('versions', $event)"
          (loadMoreItems)="loadMoreVersions()"
        />
      </div>
      <div class="d-flex gap-6 ms-auto p-6">
        <button type="button" class="btn btn-secondary" (click)="cancelFilters()">Cancel</button>
        <button type="button" class="btn btn-primary" (click)="applyFilters()">Apply</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSidePanelComponent {
  protected service = inject(BackendService);
  protected readonly filterComponents = viewChildren(TreeFilterComponent);

  readonly showFilters = model(true);

  protected readonly statesResult = toSignal(this.service.states());
  protected readonly stateItems = signal<TreeItem[] | undefined>(undefined);

  protected readonly versionsRequested$ = new BehaviorSubject(5);
  protected readonly versionsComplete = signal(false);
  protected readonly versionsPending = signal(true);
  protected readonly versionResult = toSignal(
    this.versionsRequested$.pipe(
      takeUntilDestroyed(),
      switchMap(count => this.service.versions(count))
    )
  );
  protected readonly versionItems = signal<TreeItem[] | undefined>(undefined);

  protected filterVersion(item: TreeItem, searchString: string): boolean {
    return item.label?.toLocaleLowerCase().includes(searchString.toLowerCase()) ?? false;
  }

  readonly filter = signal<FilterModel>({ states: [], versions: [], countries: [] });

  constructor() {
    effect(() => {
      const result = this.versionResult();
      if (result) {
        this.versionsComplete.set(!result?.complete);
        this.versionItems.set(result.items.map(i => toTreeItem(i, i)));
        this.versionsPending.set(false);
      }
    });
    effect(() => {
      const result = this.statesResult();
      if (result) {
        this.stateItems.set(result.map(item => toTreeItem(item.title, item)));
      }
    });
    effect(() => {
      const filterModel = this.service.filter();
      untracked(() => {
        for (const [key, value] of Object.entries(filterModel)) {
          if (Array.isArray(value) && value.length === 0) {
            this.filterComponents()
              .find(c => c.name() === key)
              ?.reset();
          }
        }
      });
    });
  }

  protected treeModelChange(name: string, event: TreeFilterSelection): void {
    this.filter.update(f => {
      return { ...f, [name]: event.selected.map(i => i.customData!) };
    });
  }

  protected loadMoreVersions(): void {
    this.versionsPending.set(true);
    this.versionsRequested$.next(this.versionsRequested$.value + 5);
  }

  protected cancelFilters(): void {
    this.showFilters.set(false);
  }

  protected applyFilters(): void {
    this.showFilters.set(false);
    this.service.filter.set({ ...this.filter() });
  }
}
