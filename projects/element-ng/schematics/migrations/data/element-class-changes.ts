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

export const ELEMENT_CLASS_CHANGES_MIGRATION: ElementClassChangeInstruction[] = [
  // btn-ghost now represents the primary ghost style; old btn-ghost (tertiary ghost) must become btn-tertiary-ghost
  {
    requiredClasses: ['btn-ghost'],
    removeClasses: ['btn-ghost'],
    addClasses: ['btn-tertiary-ghost']
  },
  // btn-primary-ghost (transitional class from v49.5.0) must become btn-ghost
  {
    requiredClasses: ['btn-primary-ghost'],
    removeClasses: ['btn-primary-ghost'],
    addClasses: ['btn-ghost']
  }
];
