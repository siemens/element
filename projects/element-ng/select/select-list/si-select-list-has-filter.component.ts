/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  OnInit,
  Signal,
  signal,
  viewChild
} from '@angular/core';
import { SiAutocompleteDirective, SiAutocompleteModule } from '@siemens/element-ng/autocomplete';
import { elementSearch, addIcons, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSelectOptionRowComponent } from '../select-option/si-select-option-row.component';
import { SiSelectGroupTemplateDirective } from '../si-select-group-template.directive';
import { SiSelectOptionRowTemplateDirective } from '../si-select-option-row-template.directive';
import { SiSelectListBase } from './si-select-list.base';

@Component({
  selector: 'si-select-list-has-filter',
  imports: [
    NgTemplateOutlet,
    SiAutocompleteDirective,
    SiIconNextComponent,
    SiSelectGroupTemplateDirective,
    SiSelectOptionRowComponent,
    SiSelectOptionRowTemplateDirective,
    SiTranslateModule,
    SiAutocompleteModule,
    SiLoadingSpinnerComponent
  ],
  templateUrl: './si-select-list-has-filter.component.html',
  styleUrl: './si-select-list-has-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  protected readonly initIndex: Signal<number>;
  protected readonly id = computed(() => `${this.baseId()}-listbox`);
  protected readonly icons = addIcons({ elementSearch });

  constructor() {
    super();
    if (!this.selectOptions.onFilter) {
      console.error('Missing implementation for `onFilter`');
    }
    const firstValue = this.selectionStrategy.arrayValue()[0];
    if (firstValue) {
      this.initIndex = computed(() =>
        this.rows().findIndex(row => row.type === 'option' && row.value === firstValue)
      );
    } else {
      this.initIndex = signal(0);
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.selectOptions.onFilter!();
    setTimeout(() => this.filterInput().nativeElement.focus());
  }

  protected input(): void {
    this.selectOptions.onFilter!(this.filterInput().nativeElement.value);
  }

  protected select(newValue: T): void {
    if (this.selectionStrategy.allowMultiple) {
      if (this.selectionStrategy.arrayValue().includes(newValue)) {
        this.selectionStrategy.updateFromUser(
          this.selectionStrategy.arrayValue().filter(value => value !== newValue)
        );
      } else {
        this.selectionStrategy.updateFromUser([...this.selectionStrategy.arrayValue(), newValue]);
      }
    } else {
      this.selectionStrategy.updateFromUser([newValue]);
    }
    this.closeOverlayIfSingle();
  }
}
