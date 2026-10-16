/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  DestroyRef,
  Directive,
  effect,
  inject,
  InjectionToken,
  input,
  numberAttribute,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { startWith } from 'rxjs';

import { SiSearchBarComponent } from './si-search-bar.component';

/** @internal */
export const SI_SEARCH_BAR = new InjectionToken<SiSearchBarComponent>('si-search-bar');

/**
 * Input used by {@link SiSearchBarComponent} instead of its default input.
 */
@Directive({
  selector: 'input[siSearchBarInput]',
  host: {
    type: 'text',
    autocomplete: 'off',
    class: 'search-bar-input form-control',
    '[disabled]': 'disabled() ?? searchBar.disabled()',
    '[placeholder]': 'placeholder() ?? searchBar.placeholder()',
    '[class.icon-end]': 'value() || searchBar.searchValue()',
    '[attr.maxlength]': 'maxlength() ?? searchBar.maxlength()',
    '[readonly]': 'readonly() ?? searchBar.readonly()',
    '[value]': 'value() ?? searchBar.searchValue()',
    '(blur)': 'searchBar.onBlur()',
    '(input)': 'searchBar.input($event)'
  }
})
export class SiSearchBarInputDirective implements OnInit {
  protected readonly searchBar = inject(SI_SEARCH_BAR);
  private readonly control = inject(NgControl, { optional: true, self: true });
  private readonly field = inject(FormField<string>, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Whether the input is disabled. Defaults to the search bar's disabled state.
   *
   * @defaultValue undefined
   */
  readonly disabled = input(undefined, { transform: booleanAttribute });

  /** Input placeholder. Defaults to the search bar's placeholder. */
  readonly placeholder = input<string>();

  /**
   * Maximum input length. Defaults to the search bar's maximum length.
   *
   * @defaultValue undefined
   */
  readonly maxlength = input(undefined, { transform: numberAttribute });

  /**
   * Whether the input is read-only. Defaults to the search bar's read-only state.
   *
   * @defaultValue undefined
   */
  readonly readonly = input(undefined, { transform: booleanAttribute });

  /**
   * Define search input content.
   */
  readonly value = input<string>();

  constructor() {
    effect(() => {
      const value = this.field?.state().value();
      if (value !== undefined) {
        this.searchBar.writeValue(value);
      }
    });
  }

  ngOnInit(): void {
    if (this.field) {
      return;
    }
    const control = this.control?.control;
    if (control) {
      control.valueChanges
        .pipe(startWith(control.value), takeUntilDestroyed(this.destroyRef))
        .subscribe(value => this.searchBar.writeValue(value));
    }
  }
}
