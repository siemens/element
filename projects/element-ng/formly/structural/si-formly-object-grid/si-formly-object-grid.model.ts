/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { FormlyFieldConfig } from '@ngx-formly/core';

export interface ToGridRowConfig {
  columns: ToGridColumnConfig[];
  classes?: string[];
}

export interface ToGridColumnConfig {
  fieldCount: number;
  classes?: string[];
}

export interface GridRow {
  columns: GridColumnConfig[];
  classes: string[];
}

export interface GridColumnConfig {
  fields?: FormlyFieldConfig[];
  classes: string[];
}
