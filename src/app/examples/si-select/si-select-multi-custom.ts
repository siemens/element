/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SiAutoCollapsableListDirective,
  SiAutoCollapsableListItemDirective,
  SiAutoCollapsableListOverflowItemDirective
} from '@siemens/element-ng/auto-collapsable-list';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SiCustomSelectDirective,
  SiSelectComboboxComponent,
  SiSelectComboboxValueComponent,
  SiSelectDropdownDirective
} from '@siemens/element-ng/select';
import { SiTreeViewComponent, TreeItem } from '@siemens/element-ng/tree-view';

import { treeItems } from '../si-tree-view/tree-items';
import {
  cloneTreeWithCheckedState,
  collectCheckedLeaves,
  compactSelected,
  expandCompactItems
} from './tree-select-utils';

/**
 * Reusable multi-select tree component with an Apply button.
 * Uses SiCustomSelectDirective as a host directive and checkboxes in the tree view.
 *
 * When all children of a parent are selected only the parent label is shown
 * in the value display instead of every individual leaf.
 */
@Component({
  selector: 'app-tree-multi-select',
  imports: [
    SiAutoCollapsableListDirective,
    SiAutoCollapsableListItemDirective,
    SiAutoCollapsableListOverflowItemDirective,
    SiSelectComboboxComponent,
    SiSelectComboboxValueComponent,
    SiSelectDropdownDirective,
    SiTreeViewComponent
  ],
  template: `
    <si-select-combobox class="text-nowrap">
      <div class="d-flex flex-fill overflow-hidden" siAutoCollapsableList>
        @if (select.value(); as value) {
          @for (item of value; track item.label) {
            <si-select-combobox-value
              class="comma-separated"
              siAutoCollapsableListItem
              [icon]="item.icon"
            >
              {{ item.label }}
            </si-select-combobox-value>
          } @empty {
            <span class="text-secondary">Select locations...</span>
          }
        } @else {
          <span class="text-secondary">Select locations...</span>
        }
        <span
          #overflow="siAutoCollapsableListOverflowItem"
          siAutoCollapsableListOverflowItem
          class="pill py-0 ms-2"
          >{{ overflow.hiddenItemCount }}+</span
        >
      </div>
    </si-select-combobox>

    <ng-template si-select-dropdown contentType="dialog">
      <div role="dialog" aria-label="Select locations">
        <si-tree-view
          class="d-block mt-n4 dropdown-menu-scroller"
          ariaLabel="Locations"
          [items]="pendingItems()"
          [enableCheckbox]="true"
          [inheritChecked]="true"
          [isVirtualized]="false"
        />
        <div class="d-flex gap-5 justify-content-end p-5 pb-2 border-top">
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="apply()">Apply</button>
        </div>
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
  protected readonly select = inject<SiCustomSelectDirective<TreeItem[]>>(SiCustomSelectDirective);

  /** The tree items to display. */
  readonly items = input.required<TreeItem[]>();

  /** Pending tree items with checkbox state (not yet applied). */
  protected readonly pendingItems = signal<TreeItem[]>([]);

  constructor() {
    this.select.openChange.subscribe(open => {
      if (open) {
        // Expand any compacted parent-items back to leaf labels so the
        // tree checkbox state is restored correctly.
        const compacted = this.select.value() ?? [];
        const expanded = expandCompactItems(compacted);
        this.pendingItems.set(cloneTreeWithCheckedState(this.items(), expanded));
      } else {
        this.pendingItems.set([]);
      }
    });
  }

  apply(): void {
    const checkedLeaves = collectCheckedLeaves(this.pendingItems());
    // Compact items so fully-selected subtrees are replaced by the parent
    // item (e.g. 'Milano' instead of every individual location).
    const compacted = compactSelected(this.items(), checkedLeaves);
    this.select.updateValue(compacted);
    this.select.close();
  }

  cancel(): void {
    this.select.close();
  }
}

@Component({
  selector: 'app-sample',
  imports: [
    TreeMultiSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    SiCardComponent,
    SiFormItemComponent
  ],
  templateUrl: './si-select-multi-custom.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedLocations: TreeItem[] = [];
  disabled = false;
  readonly = false;
  readonly treeItems = treeItems;
  readonly locationsControl = new FormControl<TreeItem[]>([], {
    nonNullable: true,
    validators: Validators.required
  });

  toggleDisabled(disabled: boolean): void {
    if (disabled) {
      this.locationsControl.disable();
    } else {
      this.locationsControl.enable();
    }
  }

  labelsOf(items: TreeItem[]): string[] {
    return items.map(item => item.label as string);
  }
}
