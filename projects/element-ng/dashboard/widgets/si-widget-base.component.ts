/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges
} from '@angular/core';

/**
 * The SiWidgetBaseComponent<T> implements the timing for the skeleton loading
 * indicator of widgets. It supports a generic value input property that represents
 * the main value to be displayed by a widget. When the value is not set, the `showLoadingIndicator`
 * changes after the `initialLoadingIndicatorDebounceTime` delay to `true` and subclasses
 * should show the skeleton loading indicator.
 */
@Component({
  template: ''
})
export abstract class SiWidgetBaseComponent<T> implements OnInit, OnChanges {
  /**
   * The main value to be displayed. If no value is set,
   * the skeleton indicates the loading of the value. Disable
   * the automatic loading mechanism by setting `SiWidgetBodyBaseComponent.disableAutoLoadingIndicator`.
   */
  readonly value = input.required<T | undefined>();
  /**
   * Option to disable automatic start of skeleton loading indication.
   *
   * @defaultValue false
   */
  readonly disableAutoLoadingIndicator = input(false, { transform: booleanAttribute });
  /**
   * Input to start and stop the skeleton loading indication.
   *
   * @defaultValue false
   */
  readonly showLoadingIndicatorInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'showLoadingIndicator',
    transform: booleanAttribute
  });

  private readonly showLoadingIndicatorInternal = signal<boolean | undefined>(false);

  readonly showLoadingIndicator = computed(() => {
    return this.showLoadingIndicatorInternal() ?? this.showLoadingIndicatorInput();
  });

  /**
   * Initial delay time in milliseconds before enabling loading indicator.
   * Only used once initially during construction.
   *
   * @defaultValue 300
   */
  readonly initialLoadingIndicatorDebounceTime = input(300);

  protected cdRef = inject(ChangeDetectorRef);
  protected loadingTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !this.disableAutoLoadingIndicator() &&
      !changes.value?.firstChange &&
      changes.value?.currentValue
    ) {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = undefined;
      }

      this.showLoadingIndicatorInternal.set(false);
    }
  }

  ngOnInit(): void {
    if (!this.disableAutoLoadingIndicator() && !this.value()) {
      this.loadingTimer = setTimeout(() => {
        this.showLoadingIndicatorInternal.set(!this.value());
      }, this.initialLoadingIndicatorDebounceTime());
    }
  }
}
