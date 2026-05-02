/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface ComponentPropertyNamesInstruction {
  /** Regex to match module import path */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** HTML attribute selector */
  attributeSelector?: string;
  /** Array of property renames: [from, to] or [from, [to1, to2]] for splitting */
  propertyMappings: { replace: string; replaceWith: string | string[] }[];
}

export const COMPONENT_PROPERTY_NAMES_MIGRATION: ComponentPropertyNamesInstruction[] = [];
