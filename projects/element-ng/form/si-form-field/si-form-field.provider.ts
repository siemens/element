/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';
import { provideSignalFormsConfig, SignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

/**
 * Provides the signal forms configuration required by {@link SiFormFieldComponent}.
 *
 * It restores the `ng-*` classes applied by the directives of {@link @angular/forms#FormsModule | FormsModule} / {@link @angular/forms#ReactiveFormsModule | ReactiveFormsModule}.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideSiFormFieldConfig()]
 * });
 * ```
 */
export const provideSiFormFieldConfig = (config: SignalFormsConfig = {}): Provider[] =>
  provideSignalFormsConfig({
    ...config,
    classes: {
      ...NG_STATUS_CLASSES,
      ...config.classes
    }
  });
