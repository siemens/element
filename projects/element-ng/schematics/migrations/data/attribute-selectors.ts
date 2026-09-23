/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface AttributeSelectorInstruction {
  /** The attribute name to replace. */
  replace: string;
  /** The new name for the attribute. */
  replaceWith: string;
  /** Attribute names to remove from elements using the selector. */
  removeAttributes?: string[];
}

export const ATTRIBUTE_SELECTORS_MIGRATION: AttributeSelectorInstruction[] = [
  // v49 to v51
  {
    replace: 'si-header-siemens-logo',
    replaceWith: 'siHeaderLogo',
    removeAttributes: ['aria-label']
  }
];
