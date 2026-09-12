/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CommonModule } from '@angular/common';
import { Component, linkedSignal, OnInit, viewChild } from '@angular/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiSelectOptionRowComponent } from '../select-option/si-select-option-row.component';
import { SiSelectGroupTemplateDirective } from '../si-select-group-template.directive';
import { SiSelectOptionRowTemplateDirective } from '../si-select-option-row-template.directive';
import { SelectOption } from '../si-select.types';
import { SiSelectListBase } from './si-select-list.base';

@Component({
  selector: 'si-select-list',
  imports: [
    CommonModule,
    SiTranslatePipe,
    SiSelectOptionRowTemplateDirective,
    SiSelectGroupTemplateDirective,
    SiSelectOptionRowComponent,
    Listbox,
    Option,
    ComboboxWidget
  ],
  templateUrl: './si-select-list.component.html'
})
export class SiSelectListComponent<T> extends SiSelectListBase<T> implements OnInit {
  /** @internal */
  readonly listbox = viewChild.required('listbox', { read: Listbox });

  protected listBoxValueChange(changeEvent: SelectOption<T>[]): void {
    if (!this.selectionStrategy.allowMultiple && changeEvent.length === 0) {
      return;
    }
    const selectedOptions = this.rows()
      .flatMap(row => (row.type === 'group' ? row.options : [row]))
      .filter(option => changeEvent.includes(option));
    this.selectionStrategy.updateFromUser(selectedOptions.map(option => option.value));
  }

  protected readonly selectedValues = linkedSignal<SelectOption<T>[]>(() => [
    ...this.selectOptions.selectedRows()
  ]);
}
