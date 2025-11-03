/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface SymbolRemovalInstruction {
  /** Module that the symbol was removed from. */
  module: RegExp;
  /** HTML element selector */
  elementSelector: string;
  /** Component class name to check for import */
  componentName: string;
  /** Names of the symbol being removed. */
  names: string[];
}

export const SYMBOL_REMOVALS_MIGRATION: SymbolRemovalInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/accordion)?/,
    elementSelector: 'si-accordion',
    componentName: 'SiAccordionComponent',
    names: ['colorVariant']
  }
];
