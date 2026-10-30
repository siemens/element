/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  computed,
  Directive,
  effect,
  inject,
  Input,
  output,
  signal,
  Signal,
  untracked,
  WritableSignal
} from '@angular/core';

import {
  SI_SELECT_OPTIONS_STRATEGY,
  SiSelectOptionsStrategy
} from '../options/si-select-options-strategy';
import { SiCustomSelectDirective } from '../si-custom-select.directive';

/**
 * Selection strategy base class.
 */
@Directive()
export abstract class SiSelectSelectionStrategy<T, IV = T | T[]> {
  /**
   * The selected value(s).
   */
  @Input() set value(value: IV | undefined) {
    if (this.select) {
      this.select.writeValue(value);
    } else {
      this.currentValue.set(value);
    }
  }

  /** Emitted when the selection is changed */
  readonly valueChange = output<IV>();

  /**
   * Whether the select control allows to select multiple values.
   * @internal
   */
  abstract readonly allowMultiple: boolean;

  /**
   * Provides the internal value always as an array
   * @internal
   */
  readonly arrayValue: Signal<readonly T[]> = computed(() =>
    this.selectOptions.selectedRows().map(option => option.value)
  );

  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);
  // Optional: the phone number input uses the strategy without SiCustomSelectDirective.
  private readonly select = inject<SiCustomSelectDirective<IV>>(SiCustomSelectDirective, {
    optional: true,
    self: true
  });
  private readonly currentValue: WritableSignal<IV | null | undefined> = this.select
    ? this.select.value
    : signal<IV | null | undefined>(undefined);

  constructor() {
    effect(() => {
      const value = this.currentValue();
      untracked(() => this.selectOptions.onValueChange([...this.toArrayValue(value)]));
    });
  }

  /**
   * CDK Listbox value changed handler.
   * @internal
   */
  updateFromUser(values: readonly T[]): void {
    const parsedValue = this.fromArrayValue(values);
    if (this.select) {
      this.select.updateValue(parsedValue);
    } else {
      this.currentValue.set(parsedValue);
    }
    this.valueChange.emit(parsedValue);
  }

  protected abstract toArrayValue(value: IV | null | undefined): readonly T[];

  protected abstract fromArrayValue(value: readonly T[]): IV;
}
