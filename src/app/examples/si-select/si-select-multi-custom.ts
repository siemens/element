/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SiAutoCollapsableListDirective,
  SiAutoCollapsableListItemDirective,
  SiAutoCollapsableListOverflowItemDirective
} from '@siemens/element-ng/auto-collapsable-list';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
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

@Component({
  selector: 'app-sample',
  imports: [
    SiAutoCollapsableListDirective,
    SiAutoCollapsableListItemDirective,
    SiAutoCollapsableListOverflowItemDirective,
    SiSelectComboboxComponent,
    SiSelectComboboxValueComponent,
    SiTreeViewComponent,
    OverlayModule,
    ComboboxPopup,
    Combobox,
    ComboboxWidget,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    SiCardComponent,
    SiFormItemComponent,
    SiSelectDropdownDirective
  ],
  templateUrl: './si-select-multi-custom.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly treeItems = treeItems;
  disabled = false;
  readonly = false;

  /** Selected locations bound via `ngModel` (button variant). */
  selectedLocations: TreeItem[] = [];

  /** Selected locations bound via reactive `formControl` (form-control variant). */
  readonly locationsControl = new FormControl<TreeItem[]>([], {
    nonNullable: true,
    validators: Validators.required
  });

  /** Open state of each variant's dropdown. */
  protected readonly modelPopupExpanded = signal(false);
  protected readonly formPopupExpanded = signal(false);

  /** Pending tree items with checkbox state (not yet applied) per variant. */
  protected readonly modelPendingItems = signal<TreeItem[]>([]);
  protected readonly formPendingItems = signal<TreeItem[]>([]);

  constructor() {
    // When a dropdown opens, expand any compacted parent-items back to leaf
    // labels so the tree checkbox state is restored correctly.
    effect(() => {
      if (this.modelPopupExpanded()) {
        this.modelPendingItems.set(
          cloneTreeWithCheckedState(this.treeItems, expandCompactItems(this.selectedLocations))
        );
      } else {
        this.modelPendingItems.set([]);
      }
    });

    effect(() => {
      if (this.formPopupExpanded()) {
        this.formPendingItems.set(
          cloneTreeWithCheckedState(this.treeItems, expandCompactItems(this.locationsControl.value))
        );
      } else {
        this.formPendingItems.set([]);
      }
    });
  }

  protected readonly applyModel = (): void => {
    // Compact items so fully-selected subtrees are replaced by the parent
    // item (e.g. 'Milano' instead of every individual location).
    const checkedLeaves = collectCheckedLeaves(this.modelPendingItems());
    this.selectedLocations = compactSelected(this.treeItems, checkedLeaves);
    this.modelPopupExpanded.set(false);
  };

  protected readonly cancelModel = (): void => {
    this.modelPopupExpanded.set(false);
  };

  protected readonly applyForm = (): void => {
    const checkedLeaves = collectCheckedLeaves(this.formPendingItems());
    this.locationsControl.setValue(compactSelected(this.treeItems, checkedLeaves));
    this.formPopupExpanded.set(false);
  };

  protected readonly cancelForm = (): void => {
    this.formPopupExpanded.set(false);
  };

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
