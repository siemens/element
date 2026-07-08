/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface SymbolRemovalInstruction {
  /** Module that the symbol was removed from. */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** HTML attribute selector */
  attributeSelector?: string;
  /** Names of the symbol being removed. */
  names: string[];
}

export const SYMBOL_REMOVALS_MIGRATION: SymbolRemovalInstruction[] = [
  // v49 to v51
  {
    module: /@siemens\/element-ng\/file-uploader/,
    elementSelector: 'si-file-uploader',
    names: ['uploadTextFileSelect']
  },
  {
    module: /@siemens\/element-ng\/file-uploader/,
    elementSelector: 'si-file-dropzone',
    names: ['uploadTextFileSelect']
  }
];
