/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { BaseHarnessFilters } from '@angular/cdk/testing';

export interface SiTypeaheadHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text for the filtered search. */
  text?: string | RegExp;
  /** Filter selected/checked items */
  isSelected?: boolean;
  /** Filter active items */
  isActive?: boolean;
}
