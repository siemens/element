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

export const ELEMENT_SELECTORS_MIGRATION: ElementSelectorInstruction[] = [
  // current to legacy
  { replace: 'si-icon', replaceWith: 'si-icon-legacy' },
  { replace: 'si-tabset', replaceWith: 'si-tabset-legacy' },
  { replace: 'si-tab', replaceWith: 'si-tab-legacy' },

  // next to current
  { replace: 'si-icon-next', replaceWith: 'si-icon' },
  { replace: 'si-tabset-next', replaceWith: 'si-tabset' },
  { replace: 'si-tab-next', replaceWith: 'si-tab' }
];
