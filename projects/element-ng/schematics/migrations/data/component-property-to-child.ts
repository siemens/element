/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

export interface ComponentPropertyToChildInstruction {
  /** Parent HTML element selector. */
  parentElementSelector: string;
  /** Child HTML element selector. */
  childElementSelector: string;
  /** Input to move from the parent to the child. */
  propertyName: string;
}

export const COMPONENT_PROPERTY_TO_CHILD_MIGRATION: ComponentPropertyToChildInstruction[] = [
  {
    parentElementSelector: 'si-map',
    childElementSelector: 'si-map-tooltip',
    propertyName: 'moreText'
  }
];
