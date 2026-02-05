/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ElementSelectorInstruction {
  /** The element name to replace. */
  replace: string;
  /** The new name for the element. */
  replaceWith: string;
}

export const ELEMENT_SELECTORS_MIGRATION: ElementSelectorInstruction[] = [];
