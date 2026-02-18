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
}

export const ELEMENT_SELECTORS_MIGRATION: ElementSelectorInstruction[] = [
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
