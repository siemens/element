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
  ...[
    ['bg-primary', 'background-accent'],
    ['bg-secondary', 'background-neutral'],
    ['bg-tertiary', 'background-4'],
    ['bg-success', 'background-success'],
    ['bg-info', 'background-information'],
    ['bg-warning', 'background-warning'],
    ['bg-danger', 'background-danger'],
    ['bg-base-0', 'background-0'],
    ['bg-base-1', 'background-1'],
    ['bg-base-2', 'background-2'],
    ['bg-base-3', 'background-3'],
    ['bg-base-4', 'background-4'],
    ['bg-base-info', 'background-information-subtle'],
    ['bg-base-success', 'background-success-subtle'],
    ['bg-base-caution', 'background-caution-subtle'],
    ['bg-base-warning', 'background-warning-subtle'],
    ['bg-base-danger', 'background-danger-subtle'],
    ['bg-base-critical', 'background-critical-subtle'],
    ['bg-base-translucent-1', 'effects-backdrop'],
    ['bg-base-translucent-2', 'background-inverse'],
    ['text-primary', 'text-accent'],
    ['text-body', 'text-primary'],
    ['text-tertiary', 'text-disabled'],
    ['text-muted', 'text-disabled'],
    ['text-info', 'text-information'],
    ['shadow', 'shadow-2'],
    ['shadow-sm', 'shadow-1'],
    ['shadow-lg', 'shadow-3'],
    ['elevation-none', 'shadow-none'],
    ['elevation-1', 'shadow-1'],
    ['elevation-2', 'shadow-2'],
    ['elevation-3', 'shadow-3'],
    ['elevation-4', 'shadow-4']
  ].map(([oldClass, newClass]) => ({
    requiredClasses: [oldClass],
    removeClasses: [oldClass],
    addClasses: [newClass]
  })),
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
    addClasses: ['si-h1']
  },
  {
    requiredClasses: ['si-title-1-bold'],
    removeClasses: ['si-title-1-bold'],
    addClasses: ['si-h4']
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
    addClasses: ['si-display-lg-sbold']
  },
  {
    requiredClasses: ['si-display-4'],
    removeClasses: ['si-display-4'],
    addClasses: ['si-display']
  },
  ...[
    ['si-h1-bold', 'si-h1'],
    ['si-h4-bold', 'si-h4'],
    ['si-caption', 'si-body-sm'],
    ['si-display-bold', 'si-display-lg-sbold']
  ].map(([oldClass, newClass]) => ({
    requiredClasses: [oldClass],
    removeClasses: [oldClass],
    addClasses: [newClass]
  }))
];
