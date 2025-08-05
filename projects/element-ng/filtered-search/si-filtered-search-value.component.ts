/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMonitorFocus, FocusOrigin } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addIcons, elementCancel, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { Observable } from 'rxjs';

import { CriterionDefinition, CriterionValue, OptionType } from './si-filtered-search.model';
import { SiFilteredSearchDateValueComponent } from './values/date-value/si-filtered-search-date-value.component';
import { SiFilteredSearchValueBase } from './values/si-filtered-search-value.base';
import { SiFilteredSearchTypeaheadComponent } from './values/typeahead/si-filtered-search-typeahead.component';

@Component({
  selector: 'si-filtered-search-value',
  imports: [
    CdkMonitorFocus,
    SiTypeaheadDirective,
    FormsModule,
    SiTranslatePipe,
    SiFilteredSearchDateValueComponent,
    SiFilteredSearchTypeaheadComponent,
    SiIconNextComponent
  ],
  templateUrl: './si-filtered-search-value.component.html',
  styleUrl: './si-filtered-search-value.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFilteredSearchValueComponent implements OnInit {
  readonly value = model.required<CriterionValue>();
  readonly definition = input.required<CriterionDefinition>();
  readonly disabled = input.required<boolean>();
  readonly readonly = input.required<boolean>();
  readonly onlySelectValue = input.required<boolean>();
  readonly maxCriteriaOptions = input.required<number>();
  readonly optionsInScrollableView = input.required<number>();
  readonly clearButtonLabel = input.required<string>();
  readonly lazyValueProvider =
    input<(criterionName: string, typed: string | string[]) => Observable<OptionType[]>>();
  readonly searchDebounceTime = input.required<number>();
  readonly itemCountText = input.required<string>();
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();
  readonly searchLabel = input.required<string>();
  readonly invalidCriterion = input.required<boolean>();
  readonly isStrictOrOnlySelectValue = input.required<boolean>();
  readonly editOnCreation = input.required<boolean>();

  readonly deleteCriterion = output<{ triggerSearch: boolean } | void>();
  readonly submitCriterion = output<{ freeText: string } | void>();

  protected readonly active = signal<boolean>(false);
  protected readonly icons = addIcons({ elementCancel });

  private hasPendingFocus = false;

  private readonly operatorInput = viewChild<ElementRef<HTMLInputElement>>('operatorInput');
  private readonly valueInput = viewChild(SiFilteredSearchValueBase);

  readonly type = computed(() => {
    switch (this.definition().validationType) {
      case 'date':
      case 'date-time':
        return 'date';
      default:
        return 'typeahead';
    }
  });
  readonly selectedOperatorIndex = computed(() => {
    const operator = this.value().operator;
    const operators = this.definition().operators;
    if (!operator || !operators) {
      return -1;
    }

    return operators.findIndex(op => op.includes(operator));
  });
  readonly longestOperatorLength = computed(() => {
    const operators = this.definition().operators;
    if (!operators) {
      return 0;
    }
    return Math.max(...operators.map(a => a.length));
  });

  ngOnInit(): void {
    if (this.editOnCreation()) {
      this.edit();
    }
  }

  edit(field?: 'value' | 'operator'): void {
    if (this.readonly()) {
      return;
    }

    this.active.set(true);
    this.hasPendingFocus = true;

    setTimeout(() => {
      if (field === 'value') {
        this.valueInput()?.focus();
      } else if (field === 'operator') {
        this.operatorInput()?.nativeElement.focus();
      } else {
        (this.operatorInput()?.nativeElement ?? this.valueInput())?.focus();
      }
      this.hasPendingFocus = false;
    });
  }

  protected backspaceOverflow(): void {
    const operatorInput = this.operatorInput()?.nativeElement;
    if (operatorInput) {
      operatorInput.focus();
    } else {
      this.deleteCriterion.emit();
    }
  }

  protected focusChange(focusOrigin: FocusOrigin): void {
    if (this.hasPendingFocus) {
      return;
    }
    setTimeout(() => {
      // We need to wait for the overlay, that might be shown and now close as well on onside click.
      if (this.active() && !focusOrigin && !this.valueInput()?.focusInOverlay()) {
        this.active.set(false);
      }
    });
  }

  protected operatorUpdate(operator: string): void {
    this.value.update(value => ({ ...value, operator }));
  }

  protected operatorBackspace(): void {
    if (!this.operatorInput()?.nativeElement.value) {
      this.deleteCriterion.emit();
    }
  }

  protected operatorEnter(): void {
    this.valueInput()!.focus();
  }

  protected operatorBlur(): void {
    const operators = this.definition().operators;
    if (operators && !operators.includes(this.value().operator!)) {
      this.operatorUpdate(operators.includes('=') ? '=' : operators[0]);
    }
  }

  protected clear(): void {
    if (!this.active() || !this.value().value?.length) {
      this.deleteCriterion.emit({ triggerSearch: true });
      return;
    }

    this.value.update(v => ({
      ...v,
      dateValue: undefined,
      value: this.definition().multiSelect ? [] : ''
    }));
  }
}
