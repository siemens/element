/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

/**
 * Reusable tree-select built with SiCustomSelectDirective as a host directive.
 * Embeds an si-tree-view inside the dropdown and lets the user pick a location.
 */
@Component({
  selector: 'app-tree-select',
  imports: [
    SiSelectComboboxComponent,
    SiSelectComboboxValueComponent,
    SiSelectDropdownDirective,
    SiTreeViewComponent
  ],
  template: `
    <si-select-combobox>
      @if (select.value(); as val) {
        <si-select-combobox-value [icon]="val.icon">
          {{ val.label }}
        </si-select-combobox-value>
      } @else {
        <span class="text-secondary">Select a location...</span>
      }
    </si-select-combobox>

    <ng-template si-select-dropdown contentType="tree">
      <si-tree-view
        class="d-block mt-n4 dropdown-menu-scroller"
        ariaLabel="Locations"
        [items]="pendingItems()"
        [enableSelection]="true"
        [singleSelectMode]="true"
        [isVirtualized]="false"
        (treeItemClicked)="selectItem($event)"
      />
      <div class="dropdown-divider"></div>
      <div class="d-flex flex-column align-items-start">
        <button
          type="button"
          class="btn btn-link mx-5 my-4"
          [disabled]="!select.value()"
          (click)="clearSelection()"
          >Clear selection</button
        >
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
export class TreeSelectComponent {
  protected readonly select = inject<SiCustomSelectDirective<TreeItem>>(SiCustomSelectDirective);

  /** The tree items to display. */
  readonly items = input<TreeItem[]>([]);

  /**
   * Pending tree items rendered inside the dropdown. The tree view mutates the
   * model (e.g. selection state), so we deep-clone the input before each open
   * to avoid leaking state back into the caller's data.
   */
  protected readonly pendingItems = signal<TreeItem[]>([]);

  constructor() {
    this.select.openChange.subscribe(open => {
      if (open) {
        const clone = JSON.parse(JSON.stringify(this.items())) as TreeItem[];
        applySelectionState(clone, this.select.value()?.label as string | undefined);
        this.pendingItems.set(clone);
      } else {
        this.pendingItems.set([]);
      }
    });
  }

  selectItem(item: TreeItem): void {
    if (item.label) {
      this.select.updateValue(item);
      this.select.close();
    }
  }

  clearSelection(): void {
    this.select.updateValue(undefined);
    this.select.close();
  }
}

/** Marks the item matching `selected` as selected. */
const applySelectionState = (items: TreeItem[], selected: string | undefined): void => {
  for (const item of items) {
    if (item.children?.length) {
      applySelectionState(item.children, selected);
    } else {
      item.selected = item.label === selected;
    }
  }
};

@Component({
  selector: 'app-sample',
  imports: [
    TreeSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    SiCardComponent,
    SiFormItemComponent
  ],
  templateUrl: './si-select-custom.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedLocation: TreeItem | undefined;
  disabled = false;
  readonly = false;
  readonly treeItems = treeItems;
  readonly locationControl = new FormControl<TreeItem | undefined>(undefined, Validators.required);

  toggleDisabled(disabled: boolean): void {
    if (disabled) {
      this.locationControl.disable();
    } else {
      this.locationControl.enable();
    }
  }
}
