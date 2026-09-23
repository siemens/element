/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface ElementSelectorInstruction {
  /** The element name to replace. */
  replace: string;
  /** The new name for the element. */
  replaceWith: string;
  /** Optional default attributes to add to the new element */
  defaultAttributes?: { name: string; value: string }[];
  /** Attribute names to remove from the renamed element. */
  removeAttributes?: string[];
}

export const ELEMENT_SELECTORS_MIGRATION: ElementSelectorInstruction[] = [
  { replace: 'si-icon-status', replaceWith: 'si-status-counter' },
  // v49 to v51
  {
    replace: 'si-header-siemens-logo',
    replaceWith: 'si-header-logo',
    removeAttributes: ['aria-label']
  }
];
