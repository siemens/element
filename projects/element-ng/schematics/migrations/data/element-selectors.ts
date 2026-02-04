/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ElementSelectorInstruction {
  /** The element name to replace. */
  replace: string;
  /** The new name for the element. */
  replaceWith: string;
  /** Optional default attributes to add to the new element */
  defaultAttributes?: { name: string; value: string }[];
}

export const ELEMENT_SELECTORS_MIGRATION: ElementSelectorInstruction[] = [
  // v47 to v48
  // current to legacy
  { replace: 'si-icon', replaceWith: 'si-icon-legacy' },
  { replace: 'si-tabset', replaceWith: 'si-tabset-legacy' },
  { replace: 'si-tab', replaceWith: 'si-tab-legacy' },

  // next to current
  { replace: 'si-icon-next', replaceWith: 'si-icon' },
  { replace: 'si-tabset-next', replaceWith: 'si-tabset' },
  { replace: 'si-tab-next', replaceWith: 'si-tab' },

  // v48 to v49
  {
    replace: 'si-unauthorized-page',
    replaceWith: 'si-info-page',
    defaultAttributes: [
      { name: 'icon', value: 'element-warning-filled' },
      { name: 'iconColor', value: 'status-warning' }
    ]
  }
];
