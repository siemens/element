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
   * Element selector that this migration applies to
   */
  elementSelector?: string;

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
  },
  {
    elementSelector: 'si-select',
    requiredClasses: [],
    excludedClasses: ['form-control', 'btn'],
    removeClasses: [],
    addClasses: ['btn', 'btn-ghost']
  },
  {
    requiredClasses: ['si-h1-black'],
    removeClasses: ['si-h1-black'],
    addClasses: ['si-h1-bold']
  },
  {
    requiredClasses: ['si-title-1-bold'],
    removeClasses: ['si-title-1-bold'],
    addClasses: ['si-h4-bold']
  },
  {
    requiredClasses: ['si-title-1'],
    removeClasses: ['si-title-1'],
    addClasses: ['si-h4']
  },
  {
    requiredClasses: ['si-title-2-bold'],
    removeClasses: ['si-title-2-bold'],
    addClasses: ['si-h5-bold']
  },
  {
    requiredClasses: ['si-title-2'],
    removeClasses: ['si-title-2'],
    addClasses: ['si-h5']
  },
  {
    requiredClasses: ['si-body-1'],
    removeClasses: ['si-body-1'],
    addClasses: ['si-body-lg']
  },
  {
    requiredClasses: ['si-body-2'],
    removeClasses: ['si-body-2'],
    addClasses: ['si-body']
  },
  {
    requiredClasses: ['si-display-1'],
    removeClasses: ['si-display-1'],
    addClasses: ['si-display-xl']
  },
  {
    requiredClasses: ['si-display-2'],
    removeClasses: ['si-display-2'],
    addClasses: ['si-display-lg']
  },
  {
    requiredClasses: ['si-display-3'],
    removeClasses: ['si-display-3'],
    addClasses: ['si-display-bold']
  },
  {
    requiredClasses: ['si-display-4'],
    removeClasses: ['si-display-4'],
    addClasses: ['si-display']
  }
];
