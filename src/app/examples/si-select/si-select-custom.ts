/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SiCustomSelectDirective,
  SiSelectComboboxComponent,
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
  imports: [SiSelectComboboxComponent, SiSelectDropdownDirective, SiTreeViewComponent],
  template: `
    <si-select-combobox>
      @if (select.value(); as val) {
        {{ val }}
      } @else {
        <span class="text-secondary">Select a location...</span>
      }
    </si-select-combobox>

    <ng-template si-select-dropdown>
      <si-tree-view
        class="d-block mt-n4 dropdown-menu-scroller"
        ariaLabel="Locations"
        [items]="items()"
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
  protected readonly select = inject(SiCustomSelectDirective);

  /** The tree items to display. */
  readonly items = input<TreeItem[]>([]);

  selectItem(item: TreeItem): void {
    if (item.label) {
      this.select.updateValue(item.label as string);
      this.select.close();
    }
  }

  clearSelection(): void {
    this.select.updateValue(undefined!);
    this.select.close();
  }
}

@Component({
  selector: 'app-sample',
  imports: [TreeSelectComponent, FormsModule, ReactiveFormsModule, SiFormItemComponent],
  templateUrl: './si-select-custom.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  selectedLocation: string | undefined;
  disabled = false;
  readonly = false;
  readonly treeItems = treeItems;
  readonly locationControl = new FormControl<string | undefined>(undefined, Validators.required);

  toggleDisabled(disabled: boolean): void {
    if (disabled) {
      this.locationControl.disable();
    } else {
      this.locationControl.enable();
    }
  }
}
