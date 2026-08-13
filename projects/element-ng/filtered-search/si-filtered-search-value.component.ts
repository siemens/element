/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMonitorFocus, FocusOrigin } from '@angular/cdk/a11y';
import { ScrollStrategy } from '@angular/cdk/overlay';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { elementCancel } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTypeaheadDirective } from '@siemens/element-ng/typeahead';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';
import { Observable } from 'rxjs';

import { InternalCriterionDefinition } from './si-filtered-search-helper';
import { CriterionValue, OptionType } from './si-filtered-search.model';
import { SiFilteredSearchDateValueComponent } from './values/date-value/si-filtered-search-date-value.component';
import { SiFilteredSearchFreeTextComponent } from './values/free-text/si-filtered-search-free-text.component';
import { SiFilteredSearchMultiSelectComponent } from './values/multi-select/si-filtered-search-multi-select.component';
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
    SiFilteredSearchFreeTextComponent,
    SiFilteredSearchTypeaheadComponent,
    SiFilteredSearchMultiSelectComponent,
    SiIconComponent
  ],
  templateUrl: './si-filtered-search-value.component.html',
  styleUrl: './si-filtered-search-value.component.scss'
})
export class SiFilteredSearchValueComponent implements OnInit {
  private readonly injector = inject(Injector);

  /** Current criterion value. Supports two-way binding through `valueChange`. */
  readonly value = model.required<CriterionValue>();

  /** Definition that configures the criterion label, operators, and value type. */
  readonly definition = input.required<InternalCriterionDefinition>();

  /** Whether the criterion value cannot be edited or cleared. */
  readonly disabled = input.required<boolean>();

  /** Whether the value editor only permits selecting configured options. */
  readonly onlySelectValue = input.required<boolean>();

  /** Maximum number of options displayed by a value typeahead. */
  readonly maxCriteriaOptions = input.required<number>();

  /** Number of options visible before a value typeahead scrolls. */
  readonly optionsInScrollableView = input.required<number>();

  /** Accessible label for the button that clears the criterion. */
  readonly clearButtonLabel = input.required<TranslatableString>();

  /** Loads value options for the criterion on demand. */
  readonly lazyValueProvider =
    input<(criterionName: string, typed: string | string[]) => Observable<OptionType[]>>();

  /** Delay in milliseconds before requesting lazy value options. */
  readonly searchDebounceTime = input.required<number>();

  /** Text used to summarize multiple selected values. */
  readonly itemCountText = input.required<TranslatableString>();

  /** Whether typing a colon or semicolon must not select a value. */
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();

  /** Accessible label for the operator and value inputs. */
  readonly searchLabel = input.required<TranslatableString>();

  /** Whether the current criterion value is invalid. */
  readonly invalidCriterion = input.required<boolean>();

  /** Whether strict or selection-only value validation is active. */
  readonly isStrictOrOnlySelectValue = input.required<boolean>();

  /** Whether the value editor opens automatically after the criterion is created. */
  readonly editOnCreation = input.required<boolean>();

  /** Factory for CDK scroll strategies used by filtered-search value editor overlays. */
  readonly scrollStrategyFactory = input.required<() => ScrollStrategy>();

  /** Emits when the criterion is deleted, optionally requesting a search update. */
  readonly deleteCriterion = output<{ triggerSearch: boolean } | void>();

  /** Emits when the criterion value is submitted, optionally with free-text content. */
  readonly submitCriterion = output<{ freeText: string } | void>();

  protected readonly active = signal<boolean>(false);
  protected readonly operatorScrollStrategy = computed(() => this.scrollStrategyFactory()());
  protected readonly datepickerScrollStrategy = computed(() => this.scrollStrategyFactory()());
  protected readonly multiSelectScrollStrategy = computed(() => this.scrollStrategyFactory()());
  protected readonly typeaheadScrollStrategy = computed(() => this.scrollStrategyFactory()());
  protected readonly icons = addIcons({ elementCancel });

  private hasPendingFocus = false;

  private readonly operatorInput = viewChild<ElementRef<HTMLInputElement>>('operatorInput');
  private readonly valueInput = viewChild(SiFilteredSearchValueBase);

  readonly type = computed(() => {
    // Check if this is a free text criterion first
    const definition = this.definition();
    if (definition.type === 'free-text') {
      return 'free-text';
    }

    const validationType = definition.validationType;
    if (validationType === 'date' || validationType === 'date-time') {
      return 'date';
    }
    // Handle multi-select vs single-select for other validation types.
    return definition.multiSelect ? 'multi-select' : 'typeahead';
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
    if (this.editOnCreation() && this.type() !== 'free-text') {
      this.edit();
    }
  }

  closeOverlay(): void {
    if (this.active()) {
      this.active.set(false);
    }
  }

  edit(field?: 'value' | 'operator'): void {
    this.active.set(true);
    this.hasPendingFocus = true;

    afterNextRender(
      () => {
        if (field === 'value') {
          this.valueInput()?.focus();
        } else if (field === 'operator') {
          this.operatorInput()?.nativeElement.focus();
        } else {
          (this.operatorInput()?.nativeElement ?? this.valueInput())?.focus();
        }
        this.hasPendingFocus = false;
      },
      { injector: this.injector }
    );
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

  protected freeTextActiveChange(value: boolean): void {
    if (!value && !this.value().value) {
      this.deleteCriterion.emit({ triggerSearch: true });
    }
  }
}
