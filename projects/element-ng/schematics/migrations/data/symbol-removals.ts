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
  // v48 to v49
  {
    module: /@(siemens|simpl)\/maps-ng/,
    elementSelector: 'si-map',
    names: ['onResize']
  },
  {
    module: /@(siemens|simpl)\/element-ng/,
    elementSelector: 'si-landing-page',
    names: ['registerNowIntroText']
  }
];
