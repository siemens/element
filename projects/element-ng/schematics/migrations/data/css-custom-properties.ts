/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface CssCustomPropertyInstruction {
  /** The CSS custom property to replace. */
  replace: string;
  /** The new CSS custom property name. */
  replaceWith: string;
}

export const CSS_CUSTOM_PROPERTIES_MIGRATION: CssCustomPropertyInstruction[] = [
  {
    replace: '--si-feedback-icon-offset',
    replaceWith: '--si-feedback-icon-size'
  }
];
