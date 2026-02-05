/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ComponentNamesInstruction {
  module: RegExp;
  toModule?: string;
  symbolRenamings: { replace: string; replaceWith: string }[];
}

export const COMPONENT_NAMES_MIGRATION: ComponentNamesInstruction[] = [];
