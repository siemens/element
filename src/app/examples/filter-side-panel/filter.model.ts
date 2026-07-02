/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface Country {
  code: string;
  name: string;
}

export interface Status {
  id: string;
  title: string;
}

export type Version = string;

export interface FilterModel {
  states: Status[];
  versions: Version[];
  countries: Country[];
}

export interface Result<T> {
  complete: boolean;
  count: number;
  items: T[];
}
