/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, inject, Input, output, Signal } from '@angular/core';

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
    this.select.writeValue(value);
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
  private readonly select = inject<SiCustomSelectDirective<IV>>(SiCustomSelectDirective, {
    self: true
  });

  constructor() {
    this.select.registerOnValueWrite(value => this.syncSelection(value));
  }

  /**
   * CDK Listbox value changed handler.
   * @internal
   */
  updateFromUser(values: readonly T[]): void {
    const parsedValue = this.fromArrayValue(values);
    this.select.updateValue(parsedValue);
    this.valueChange.emit(parsedValue);
  }

  protected abstract toArrayValue(value: IV | null | undefined): readonly T[];

  protected abstract fromArrayValue(value: readonly T[]): IV;

  private syncSelection(value: IV | null | undefined): void {
    this.selectOptions.onValueChange([...this.toArrayValue(value)]);
  }
}
