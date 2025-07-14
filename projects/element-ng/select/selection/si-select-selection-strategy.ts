/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  Input,
  output,
  signal,
  Signal
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

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
export abstract class SiSelectSelectionStrategy<T, IV = T | T[]> implements ControlValueAccessor {
  /**
   * Whether the select input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * The selected value(s).
   */
  @Input() set value(value: IV | undefined) {
    this.updateFromInput(this.toArrayValue(value));
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

  /**
   * Registered form callback which shall be called on blur.
   * @internal
   */
  onTouched: () => void = () => {};
  /** @internal */
  public readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected onChange: (_: any) => void = () => {};
  private readonly disabledNgControl = signal(false);
  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * CDK Listbox value changed handler.
   * @internal
   */
  updateFromUser(values: T[]): void {
    const parsedValue = this.fromArrayValue(values);
    this.onChange(parsedValue);
    this.valueChange.emit(parsedValue);
    this.selectOptions.onValueChange(values);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  writeValue(obj: any): void {
    this.updateFromInput(this.toArrayValue(obj));
  }

  protected abstract toArrayValue(value: IV | undefined): readonly T[];

  protected abstract fromArrayValue(value: readonly T[]): IV;

  private updateFromInput(values: readonly T[]): void {
    this.selectOptions.onValueChange(values);
  }
}
