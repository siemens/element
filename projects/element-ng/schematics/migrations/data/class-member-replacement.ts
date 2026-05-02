/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

export interface ClassMemberReplacementInstruction {
  /** Regex to match module import path where the type is defined */
  module: RegExp;
  /** The type name(s) to match (e.g., 'SiResponsiveContainerDirective') */
  typeNames: string[];
  /** Property access transformations */
  propertyReplacements: {
    /** Original property name */
    property: string;
    /** Replacement string. Use placeholders: '$\{expression\}' for the object expression, '$\{property\}' for the property name */
    replacement: string;
  }[];
}

export const CLASS_MEMBER_REPLACEMENTS_MIGRATION: ClassMemberReplacementInstruction[] = [];
