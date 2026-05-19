/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  Directive,
  input,
  OnChanges,
  OnInit,
  signal
} from '@angular/core';

/**
 * The SiWidgetBaseDirective<T> implements the timing for the skeleton loading
 * indicator of widgets. It supports a generic value input property that represents
 * the main value to be displayed by a widget. When the value is not set, the `showLoadingIndicator`
 * changes after the `initialLoadingIndicatorDebounceTime` delay to `true` and subclasses
 * should show the skeleton loading indicator.
 */
@Directive()
export abstract class SiWidgetBaseDirective<T> implements OnInit, OnChanges {
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

  protected readonly showLoadingIndicatorInternal = signal<boolean | undefined>(undefined);

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

  protected loadingTimer?: ReturnType<typeof setTimeout>;

  /**
   * Returns whether the widget currently has data to display. The base
   * implementation only inspects {@link value}. Subclasses with additional
   * data inputs SHOULD override this to consider those inputs as well, so the
   * automatic loading indicator is suppressed when any data is available.
   */
  protected hasWidgetData(): boolean {
    return !!this.value();
  }

  ngOnChanges(): void {
    if (this.disableAutoLoadingIndicator()) {
      return;
    }

    if (this.hasWidgetData()) {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = undefined;
      }
      this.showLoadingIndicatorInternal.set(false);
    } else {
      // Data was removed: yield control back to the `showLoadingIndicator` input
      // so callers can drive the loader manually.
      this.showLoadingIndicatorInternal.set(undefined);
    }
  }

  ngOnInit(): void {
    if (!this.disableAutoLoadingIndicator() && !this.hasWidgetData()) {
      this.loadingTimer = setTimeout(() => {
        this.showLoadingIndicatorInternal.set(!this.hasWidgetData());
      }, this.initialLoadingIndicatorDebounceTime());
    }
  }
}
