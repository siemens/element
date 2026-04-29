/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SiCustomSelectDirective,
  SiSelectComboboxComponent,
  SiSelectDropdownDirective
} from '@siemens/element-ng/select';
import { SiTreeViewComponent, TreeItem } from '@siemens/element-ng/tree-view';

import { treeItems } from '../si-tree-view/tree-items';

/**
 * Deep-clones tree items and sets the `checked` state based on the provided selected labels.
 */
const cloneWithCheckedState = (items: TreeItem[], selected: string[]): TreeItem[] =>
  items.map(item => {
    const children = item.children?.length
      ? cloneWithCheckedState(item.children, selected)
      : undefined;
    const isLeaf = !children;

    let checked: 'checked' | 'unchecked' | 'indeterminate' | undefined;
    if (isLeaf) {
      checked = selected.includes(item.label as string) ? 'checked' : 'unchecked';
    } else if (children) {
      const allChecked = children.every(c => c.checked === 'checked');
      const someChecked = children.some(
        c => c.checked === 'checked' || c.checked === 'indeterminate'
      );
      checked = allChecked ? 'checked' : someChecked ? 'indeterminate' : 'unchecked';
    }

    return {
      ...item,
      checked,
      children
    };
  });

/**
 * Collects all checked leaf labels from a tree.
 */
const collectCheckedLeaves = (items: TreeItem[]): string[] => {
  const result: string[] = [];
  for (const item of items) {
    if (item.children?.length) {
      result.push(...collectCheckedLeaves(item.children));
    } else if (item.checked === 'checked' && item.label) {
      result.push(item.label as string);
    }
  }
  return result;
};

/**
 * Reusable multi-select tree component with an Apply button.
 * Uses SiCustomSelectDirective as a host directive and checkboxes in the tree view.
 */
@Component({
  selector: 'app-tree-multi-select',
  imports: [SiSelectComboboxComponent, SiSelectDropdownDirective, SiTreeViewComponent],
  template: `
    <si-select-combobox>
      @if (select.value()?.length) {
        <span class="text-truncate">{{ select.value()!.join(', ') }}</span>
      } @else {
        <span class="text-secondary">Select locations...</span>
      }
    </si-select-combobox>

    <ng-template si-select-dropdown>
      <si-tree-view
        class="d-block mt-n4 dropdown-menu-scroller"
        ariaLabel="Locations"
        [items]="pendingItems()"
        [enableCheckbox]="true"
        [inheritChecked]="true"
        [isVirtualized]="false"
      />
      <div class="d-flex gap-2 justify-content-end p-4 pb-0 border-top">
        <button type="button" class="btn btn-sm btn-secondary" (click)="cancel()">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary" (click)="apply()">Apply</button>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: SiCustomSelectDirective,
      inputs: ['disabled', 'readonly', 'value'],
      outputs: ['valueChange']
    }
  ]
})
export class TreeMultiSelectComponent {
  protected readonly select = inject<SiCustomSelectDirective<string[]>>(SiCustomSelectDirective);

  /** The tree items to display. */
  readonly items = input<TreeItem[]>([]);

  /** Pending tree items with checkbox state (not yet applied). */
  protected readonly pendingItems = signal<TreeItem[]>([]);

  constructor() {
    this.select.openChange.subscribe(open => {
      if (open) {
        // Create a fresh clone with checked state derived from the current value
        this.pendingItems.set(cloneWithCheckedState(this.items(), this.select.value() ?? []));
      } else {
        // Clear references on close so no stale tree item objects are retained
        this.pendingItems.set([]);
      }
    });
  }

  apply(): void {
    const selected = collectCheckedLeaves(this.pendingItems());
    this.select.updateValue(selected);
    this.select.close();
  }

  cancel(): void {
    this.select.close();
  }
}

@Component({
  selector: 'app-sample',
  imports: [TreeMultiSelectComponent, FormsModule, SiFormItemComponent],
  templateUrl: './si-select-multi-custom.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedLocations: string[] = [];
  disabled = false;
  readonly = false;
  readonly treeItems = treeItems;
}
