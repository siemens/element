/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CommonModule } from '@angular/common';
import { afterRenderEffect, Component, inject, OnInit, signal, viewChild } from '@angular/core';
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
  override ngOnInit(): void {
    super.ngOnInit();
    //setTimeout(() => this.listbox().nativeElement.focus());
  }

  readonly listbox = viewChild.required('listbox', { read: Listbox });

  protected listBoxValueChange(changeEvent: SelectOption<T>[]): void {
    this.selectionStrategy.updateFromUser(changeEvent.map(option => option.value));
  }

  /**
   * @defaultValue
   * ```
   * this.selectOptions.selectedRows() as SelectOption<T>[]
   * ```
   */
  readonly selectedValues = signal<SelectOption<T>[]>(
    this.selectOptions.selectedRows() as SelectOption<T>[]
  );
}
