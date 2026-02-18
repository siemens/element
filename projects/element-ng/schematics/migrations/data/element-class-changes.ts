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
  // btn-circle with btn-sm should have btn-sm removed
  {
    requiredClasses: ['btn', 'btn-circle', 'btn-sm'],
    removeClasses: ['btn-sm'],
    addClasses: []
  },
  // btn-circle with btn-xs should migrate to btn-sm
  {
    requiredClasses: ['btn', 'btn-circle', 'btn-xs'],
    removeClasses: ['btn-xs'],
    addClasses: ['btn-sm']
  },
  // btn-circle without size modifier should get btn-lg
  {
    requiredClasses: ['btn', 'btn-circle'],
    excludedClasses: ['btn-lg', 'btn-sm', 'btn-xs'],
    removeClasses: [],
    addClasses: ['btn-lg']
  },
  // Non-circle buttons with btn-xs should migrate to btn-sm
  {
    requiredClasses: ['btn', 'btn-xs'],
    excludedClasses: ['btn-circle'],
    removeClasses: ['btn-xs'],
    addClasses: ['btn-sm']
  }
];
