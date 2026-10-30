/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import type { SiSearchBarComponent } from './si-search-bar.component';

/**
 * Input used by {@link SiSearchBarComponent} instead of its default input.
 */
@Directive({
  selector: 'input[siSearchBarInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiSearchBarInputDirective,
      multi: true
    }
  ],
  host: {
    type: 'text',
    autocomplete: 'off',
    class: 'search-bar-input form-control',
    '[disabled]': 'isDisabled()',
    '[readonly]': 'readonly()',
    '[class.icon-end]': 'hasValue()',
    '(input)': 'updateValue()'
  }
})
export class SiSearchBarInputDirective extends DefaultValueAccessor implements OnInit {
  private input = inject(ElementRef<HTMLInputElement>);
  private readonly value = signal('');
  private readonly formDisabled = signal(false);
  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @internal */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** @internal */
  readonly hasValue = computed(() => !!this.value());

  ngOnInit(): void {
    this.updateValue();
  }

  /** @internal */
  override writeValue(value: unknown): void {
    super.writeValue(value);
    this.updateValue();
  }

  /** @internal */
  override setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    super.setDisabledState(this.isDisabled());
  }

  protected updateValue(): void {
    this.value.set(this.input.nativeElement.value);
  }

  onReset(): void {
    this.writeValue('');
    this.onChange('');
    // Commit the clear action for debounced or blur-updated fields.
    this.onTouched();
    this.input.nativeElement.focus();
  }
}
