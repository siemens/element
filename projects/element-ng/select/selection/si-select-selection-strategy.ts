/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  inject,
  input,
  ModelSignal,
  output,
  Signal,
  untracked
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

import {
  SI_SELECT_OPTIONS_STRATEGY,
  SiSelectOptionsStrategy
} from '../options/si-select-options-strategy';

/**
 * Selection strategy base class.
 */
@Directive({
  host: {
    '[class.disabled]': 'disabled()'
  }
})
export abstract class SiSelectSelectionStrategy<T, IV = T | T[]> implements FormValueControl<IV> {
  /**
   * Whether the select input is disabled.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The selected value(s).
   */
  abstract readonly value: ModelSignal<IV>;

  readonly touch = output();

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

  /** @internal */
  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);

  constructor() {
    effect(() => {
      const arrayValue = this.toArrayValue(this.value());
      // That way the effect only tracks value(), and the reads/writes of selectedRows/rows inside onValueChange no longer feed back into it.
      untracked(() => this.selectOptions.onValueChange(arrayValue));
    });
  }

  /**
   * CDK Listbox value changed handler.
   * @internal
   */
  updateFromUser(values: T[]): void {
    const parsedValue = this.fromArrayValue(values);
    this.value.set(parsedValue);
  }

  protected abstract toArrayValue(value: IV | undefined): readonly T[];

  protected abstract fromArrayValue(value: readonly T[]): IV;
}
