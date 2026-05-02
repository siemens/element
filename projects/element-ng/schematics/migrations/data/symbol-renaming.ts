/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface SymbolRenamingInstruction {
  module: RegExp;
  toModule?: string;
  symbolRenamings: { replace: string; replaceWith: string }[];
}

export const SYMBOL_RENAMING_MIGRATION: SymbolRenamingInstruction[] = [];
