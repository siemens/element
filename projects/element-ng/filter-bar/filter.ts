/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export type FilterStatusType = 'default' | 'success' | 'info' | 'warning' | 'danger' | 'inactive';

export interface Filter {
  /**
   * Identification name of filter pill.
   * Is not shown to the user, please specify either a {@link title} or a {@link description}.
   */
  filterName: string;
  /**
   * Shown title of filter pill.
   * Can be left empty if {@link description} is used.
   */
  title?: string;
  /**
   * Short description of filter pill.
   * Can be left empty if {@link title} is used to align the title to middle of pill.
   */
  description?: string;
  /**
   * Status of filter pill
   */
  status: FilterStatusType;
}
