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
  Input,
  output,
  Signal,
  untracked
} from '@angular/core';

import {
  SI_SELECT_OPTIONS_STRATEGY,
  SiSelectOptionsStrategy
} from '../options/si-select-options-strategy';
import { SiCustomSelectDirective } from '../si-custom-select.directive';

/**
 * Selection strategy base class.
 */
@Directive({
  host: {
    '[class.disabled]': 'disabled()'
  }
})
export abstract class SiSelectSelectionStrategy<T, IV = T | T[]> {
  /**
   * Whether the select input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /** The selected value(s). */
  @Input() set value(value: IV | undefined) {
    if (this.customSelect) {
      this.customSelect.value.set(value);
    } else {
      this.selectOptions.onValueChange(this.toArrayValue(value));
    }
  }

  /** Emitted when the selection is changed. */
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

  private readonly customSelect = inject<SiCustomSelectDirective<IV>>(SiCustomSelectDirective, {
    optional: true
  });
  private readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);

  /** @internal */
  readonly disabled = computed(() => this.customSelect?.disabled() ?? this.disabledInput());

  constructor() {
    if (this.customSelect) {
      effect(() => {
        const value = this.customSelect!.value();
        untracked(() => this.selectOptions.onValueChange(this.toArrayValue(value)));
      });
    }
  }

  /**
   * CDK Listbox value changed handler.
   * @internal
   */
  updateFromUser(values: readonly T[]): void {
    const parsedValue = this.fromArrayValue(values);
    this.customSelect?.updateValue(parsedValue);
    this.valueChange.emit(parsedValue);

    if (!this.customSelect) {
      this.selectOptions.onValueChange(values);
    }
  }

  /** @internal */
  onTouched(): void {
    this.customSelect?.markAsTouched();
  }

  protected abstract toArrayValue(value: IV | undefined): readonly T[];

  protected abstract fromArrayValue(value: readonly T[]): IV;
}
