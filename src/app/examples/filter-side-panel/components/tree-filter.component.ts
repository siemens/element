/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import {
  CheckboxClickEventArgs,
  CheckboxState,
  SiTreeViewComponent,
  TreeItem
} from '@siemens/element-ng/tree-view';
import { TranslatableString } from '@siemens/element-translate-ng';
import { SiTranslatePipe } from 'projects/element-translate-ng/translate';

import { visitItems } from '../data-utils';

export type Selection = 'all' | 'none' | 'some';

export interface TreeFilterSelection {
  selection: Selection;
  selected: TreeItem[];
}

export type FilterFunction = (item: TreeItem, searchString: string) => boolean;

const SELECT_ALL = 'select-all';

const getItems = (items: TreeItem[], state: CheckboxState): TreeFilterSelection => {
  const pending: TreeItem[] = [...items];
  const selected: TreeItem[] = [];
  let itemCount = 0;
  let selectionCount = 0;
  let item = pending.shift();
  while (item) {
    itemCount++;
    if (item.checked === state) {
      selectionCount++;
      selected.push(item);
    }
    if (item.children) {
      pending.push(...item.children);
    }
    item = pending.shift();
  }

  const selection = selectionCount === 0 ? 'none' : selectionCount === itemCount ? 'all' : 'some';
  return { selection, selected };
};

@Component({
  selector: 'app-tree-filter',
  imports: [
    SiCollapsiblePanelComponent,
    SiLoadingSpinnerDirective,
    SiSearchBarComponent,
    SiTreeViewComponent,
    SiTranslatePipe
  ],
  template: `
    <si-collapsible-panel
      contentCssClasses="p-6"
      badgeColor="primary"
      [heading]="label()"
      [badge]="selectedItems() > 0 ? selectedItems() : undefined"
    >
      @if (filter()) {
        <si-search-bar colorVariant="base-0" [showIcon]="true" (searchChange)="onSearch($event)" />
      }
      <si-tree-view
        class="d-block h-100 tree-xs ms-n5 my-6"
        [siLoading]="isLoading()"
        [ariaLabel]="label()"
        [enableCheckbox]="true"
        [folderStateStart]="false"
        [items]="visibleItems()"
        (treeItemCheckboxClicked)="updateSelection($event)"
      />
      @if (!isLoading() && loadMore()) {
        <button type="button" class="btn btn-link" (click)="loadMoreItems.emit()">{{
          loadMoreText() | translate
        }}</button>
      }
    </si-collapsible-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-flex flex-column gap-2'
  }
})
export class TreeFilterComponent {
  readonly name = input.required<string>();
  /** Label for the filter */
  readonly label = input<string>();
  /** Tree items */
  readonly items = input<TreeItem[]>();
  /** Whether to select all item is available */
  readonly selectAll = input<boolean>(true);
  /** Whether the filter should show a loading indicator */
  readonly loading = input<boolean>(false);
  /** Whether the filter should show a "load more" button */
  readonly loadMore = input<boolean>(false);
  /** Text for the "load more" button */
  readonly loadMoreText = input<TranslatableString>('Show more');
  readonly filter = input<FilterFunction | undefined>(undefined);

  readonly loadMoreItems = output<void>();
  readonly selectionChange = output<TreeFilterSelection>();
  readonly searchChange = output<string>();

  protected readonly searchTerm = signal('');
  protected readonly isLoading = computed(() => this.loading() || !this.items());
  protected readonly showSelectAll = computed(
    () => this.selectAll() && this.items()?.length && this.searchTerm().length === 0
  );
  /** Actual tree items including select all. */
  protected readonly visibleItems = computed<TreeItem[]>(() => {
    const items = this.items();
    if (!items) {
      return [];
    }
    if (this.showSelectAll()) {
      return [
        {
          label: 'Select all',
          state: 'expanded',
          customData: SELECT_ALL,
          checked: 'unchecked',
          children: items
        }
      ];
    } else {
      return this.filterTree(items, this.searchTerm());
    }
  });

  /** Current selection count or undefined if nothing is selected */
  protected readonly selectedItems = signal<number>(0);

  /** Reset selection state of all items. */
  reset(): void {
    if (this.selectedItems()) {
      visitItems(this.visibleItems(), item => (item.checked = 'unchecked'));
      this.selectedItems.set(0);
    }
  }

  protected updateSelection(event: CheckboxClickEventArgs): void {
    const items = this.items()!;
    const checked = event.newState === 'checked';
    if (event.target.customData === SELECT_ALL) {
      let count = 0;
      visitItems(event.target.children ?? [], item => {
        item.checked = event.newState;
        count++;
      });
      this.selectedItems.set(checked ? count : 0);
      this.selectionChange.emit({
        selection: event.newState === 'checked' ? 'all' : 'none',
        selected: event.newState === 'checked' ? items : []
      });
    } else {
      const selected = getItems(items, 'checked');
      this.selectedItems.set(selected.selected.length);
      this.selectionChange.emit(selected);
    }
  }

  protected onSearch(searchString: string): void {
    this.searchTerm.set(searchString);
    this.searchChange.emit(searchString);
  }

  protected filterTree(items: TreeItem[], searchString: string): TreeItem[] {
    if (searchString.length === 0) {
      return items;
    }
    const filter = this.filter()!;
    const filtered: TreeItem[] = [];
    for (const current of items) {
      if (filter(current, searchString)) {
        filtered.push(current);
      } else {
        if (current.children) {
          const filteredChildren = this.filterTree(current.children, searchString);
          if (filteredChildren.length) {
            const newItem = { ...current, children: filteredChildren };
            filtered.push(newItem);
          }
        }
      }
    }
    return filtered;
  }
}
