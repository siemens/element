/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { numberAttribute } from '@angular/core';

/**
 * Converts a given value to a positive number or 0.
 * @param value - The value to convert to a positive number.
 * @returns A positive number, or 0 if the input is not a valid number.
 */
export const positiveNumberAttribute = (value: string | number): number => {
  return Math.max(0, numberAttribute(value));
};
