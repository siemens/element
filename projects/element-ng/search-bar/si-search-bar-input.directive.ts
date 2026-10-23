/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterEveryRender,
  booleanAttribute,
  computed,
  Directive,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { FormField } from '@angular/forms/signals';

import type { SiSearchBarComponent } from './si-search-bar.component';

/**
 * Input used by {@link SiSearchBarComponent} instead of its default input.
 */
@Directive({
  selector: 'input[siSearchBarInput]',
  host: {
    type: 'text',
    autocomplete: 'off',
    class: 'search-bar-input form-control',
    '[disabled]': 'disabled()',
    '[readonly]': 'readonly()',
    '[class.icon-end]': 'hasValue()',
    '(input)': 'updateValue()'
  }
})
export class SiSearchBarInputDirective implements OnInit {
  private input = inject(ElementRef<HTMLInputElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly value = signal('');
  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @internal */
  readonly hasValue = computed(() => !!(this.field?.state().value() ?? this.value()));
  private readonly control = inject(NgControl, { optional: true, self: true });
  private readonly field = inject(FormField<string>, { optional: true, self: true });

  constructor() {
    afterEveryRender(() => this.updateValue());
  }

  ngOnInit(): void {
    this.control?.valueChanges
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateValue());
  }

  protected updateValue(): void {
    this.value.set(this.input.nativeElement.value);
  }

  onReset(): void {
    if (!this.field) {
      this.control?.reset('');
    } else {
      this.field.state().value.set('');
    }
    if (!this.control && !this.field) {
      this.input.nativeElement.value = '';
    }
    this.updateValue();
    this.input.nativeElement.focus();
  }
}
