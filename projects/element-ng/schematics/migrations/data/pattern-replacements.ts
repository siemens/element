/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

export interface PatternReplacementInstruction {
  /** Regex to match module import path */
  module: RegExp;
  /** Optional: Only apply if these specific symbols are imported from the module */
  requiresSymbols: string[];
  /** Array of pattern replacements */
  patterns: {
    /** Regex pattern to match in the source code */
    pattern: RegExp;
    /** Replacement string */
    replacement: string;
  }[];
}

export const PATTERN_REPLACEMENTS_MIGRATION: PatternReplacementInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/filtered-search)?/,
    requiresSymbols: ['Criterion', 'CriterionValue', 'CriterionDefinition'],
    patterns: [
      // Union types: CriterionValue | Criterion → CriterionValue
      { pattern: /\bCriterionValue\s*\|\s*Criterion\b/g, replacement: 'CriterionValue' },
      { pattern: /\bCriterion\s*\|\s*CriterionValue\b/g, replacement: 'CriterionValue' },
      // Array union types: Criterion[] | CriterionDefinition[] → CriterionDefinition[]
      {
        pattern: /\bCriterion\[\]\s*\|\s*CriterionDefinition\[\]/g,
        replacement: 'CriterionDefinition[]'
      },
      {
        pattern: /\bCriterionDefinition\[\]\s*\|\s*Criterion\[\]/g,
        replacement: 'CriterionDefinition[]'
      },
      // Intersection types: CriterionValue & Criterion → CriterionValue
      { pattern: /\bCriterionValue\s*&\s*Criterion\b/g, replacement: 'CriterionValue' },
      { pattern: /\bCriterion\s*&\s*CriterionValue\b/g, replacement: 'CriterionValue' },
      // Array intersection types: Criterion[] & CriterionDefinition[] → CriterionDefinition[]
      {
        pattern: /\bCriterion\[\]\s*&\s*CriterionDefinition\[\]/g,
        replacement: 'CriterionDefinition[]'
      },
      {
        pattern: /\bCriterionDefinition\[\]\s*&\s*Criterion\[\]/g,
        replacement: 'CriterionDefinition[]'
      }
    ]
  },
  {
    module: /@(siemens|simpl)\/element-ng(\/resize-observer)?/,
    requiresSymbols: ['SiResponsiveContainerDirective'],
    patterns: [
      { pattern: /\.isXs\b/g, replacement: '.xs()' },
      { pattern: /\.isSm\b/g, replacement: '.sm()' },
      { pattern: /\.isMd\b/g, replacement: '.md()' },
      { pattern: /\.isLg\b/g, replacement: '.lg()' },
      { pattern: /\.isXl\b/g, replacement: '.xl()' },
      { pattern: /\.isXxl\b/g, replacement: '.xxl()' }
    ]
  },
  // v48 to v49 - Modal initialState → inputValues
  // Only matches initialState within .show() calls
  {
    module: /@(siemens|simpl)\/element-ng(\/modal)?/,
    requiresSymbols: ['SiModalService'],
    patterns: [
      // Matches: .show(Component, { initialState: ... })
      // Pattern breakdown:
      //   $1 = '.show(Component, { ' up to the word boundary before initialState
      //   $2 = 'initialState' (the property name we're replacing)
      //   $3 = ':' (the colon after the property)
      {
        pattern: /(\bshow\([^)]*,\s*\{[^}]*\b)(initialState)(\s*:)/gs,
        replacement: '$1inputValues$3'
      }
    ]
  }
];
