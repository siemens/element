/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/**
 * Element classes migration
 *
 */
export interface ElementClassChangeInstruction {
  /**
   * Classes that must be present for this migration to apply
   */
  requiredClasses: string[];

  /**
   * Classes that must NOT be present for this migration to apply
   */
  excludedClasses?: string[];

  /**
   * Classes to remove
   */
  removeClasses: string[];

  /**
   * Classes to add
   */
  addClasses: string[];
}

export const ELEMENT_CLASS_CHANGES_MIGRATION: ElementClassChangeInstruction[] = [];
