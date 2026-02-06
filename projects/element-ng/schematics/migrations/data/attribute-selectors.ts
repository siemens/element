/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface AttributeSelectorInstruction {
  /** The attribute name to replace. */
  replace: string;
  /** The new name for the attribute. */
  replaceWith: string;
}

export const ATTRIBUTE_SELECTORS_MIGRATION: AttributeSelectorInstruction[] = [];
