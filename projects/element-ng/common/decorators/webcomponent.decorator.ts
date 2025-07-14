/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Type } from '@angular/core';

// note: this _must_ be a function, not an arrow
// eslint-disable-next-line
export function WebComponentContentChildren<T>(host: Type<T>) {
  // holds the Type information of child component and the property name of parent component which is used to hold it.
  return (...args: any) => {
    args[0].__contentQuery = {
      host,
      prop: args[1]
    };
  };
}
