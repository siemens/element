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
  model,
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
  readonly value = model<IV | undefined>();

  /**
   * Whether the select control allows to select multiple values.
   * @internal
   */
  abstract readonly allowMultiple: boolean;

  /**
   * Provides the internal value always as an array
   * @internal
   */
  readonly arrayValue: Signal<readonly T[]> = computed(() => this.toArrayValue(this.value()));

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

  constructor() {
    effect(() => this.selectOptions.onValueChange(this.arrayValue()));
  }

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
    this.value.set(parsedValue);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  writeValue(obj: any): void {
    this.value.set(obj);
  }

  protected abstract toArrayValue(value: IV | undefined): readonly T[];

  protected abstract fromArrayValue(value: readonly T[]): IV;
}
