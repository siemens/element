/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

export const SI_TRANSLATABLE_VALUES = new InjectionToken<Record<string, string>[]>(
  'si-element-translatable-values'
);
