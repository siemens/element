/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';

export interface CopyrightDetails {
  /**
   * The year when the app was first released.
   */
  startYear: number;
  /**
   * The year when the app was last updated. Must be left blank if it equals {@link startYear}
   */
  lastUpdateYear?: number;
  /**
   * The company name to be displayed in the copyright notice (not to be translated).
   */
  company?: string;
}

/**
 * The injection token to be used when used globally across the app
 */
export const SI_COPYRIGHT_DETAILS = new InjectionToken<CopyrightDetails>('SI_COPYRIGHT_DETAILS');
