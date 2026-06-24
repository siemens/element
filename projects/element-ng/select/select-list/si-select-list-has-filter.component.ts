/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  OnInit,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { elementSearch } from '@siemens/element-icons';
import { SiAutocompleteDirective, SiAutocompleteModule } from '@siemens/element-ng/autocomplete';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSelectOptionRowComponent } from '../select-option/si-select-option-row.component';
import { SiSelectGroupTemplateDirective } from '../si-select-group-template.directive';
import { SiSelectOptionRowTemplateDirective } from '../si-select-option-row-template.directive';
import { SelectOption } from '../si-select.types';
import { SiSelectListBase } from './si-select-list.base';

@Component({
  selector: 'si-select-list-has-filter',
  imports: [
    NgTemplateOutlet,
    SiAutocompleteDirective,
    SiIconComponent,
    SiSelectGroupTemplateDirective,
    SiSelectOptionRowComponent,
    SiSelectOptionRowTemplateDirective,
    SiTranslatePipe,
    SiAutocompleteModule,
    SiLoadingSpinnerComponent,
    ComboboxWidget,
    ComboboxPopup,
    Combobox
  ],
  templateUrl: './si-select-list-has-filter.component.html',
  styleUrl: './si-select-list-has-filter.component.scss',
  host: {
    class: 'pt-0',
    '[attr.id]': 'id()'
  }
})
export class SiSelectListHasFilterComponent<T> extends SiSelectListBase<T> implements OnInit {
  /** Placeholder for search input field. */
  readonly filterPlaceholder = input.required<TranslatableString>();
  /** Label if no item can be found. */
  readonly noResultsFoundLabel = input.required<TranslatableString>();

  protected readonly filterInput = viewChild.required<ElementRef<HTMLInputElement>>('filter');
  protected readonly id = computed(() => `${this.baseId()}-listbox`);
  protected readonly icons = addIcons({ elementSearch });
  /**
   * @defaultValue
   * ```
   * this.selectOptions.selectedRows() as SelectOption<T>[]
   * ```
   */
  readonly selectedValues = signal<SelectOption<T>[]>(
    this.selectOptions.selectedRows() as SelectOption<T>[]
  );

  constructor() {
    super();
    if (!this.selectOptions.onFilter) {
      console.error('Missing implementation for `onFilter`');
    }
    afterRenderEffect(() => {
      //if (this.popupExpanded()) {
      untracked(() => {
        setTimeout(() => {
          this.filterInput()?.nativeElement.focus();
        });
      });
      //}
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.selectOptions.onFilter!();
    //setTimeout(() => this.filterInput().nativeElement.focus());
  }

  protected input(): void {
    this.selectOptions.onFilter!(this.filterInput().nativeElement.value);
  }

  protected select(): void {
    this.selectionStrategy.updateFromUser(this.selectedValues().map(option => option.value));
    this.closeOverlayIfSingle();
  }
}
