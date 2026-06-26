/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface ProviderFunctionRemovalInstruction {
  /** Module that the provider function was imported from. */
  module: RegExp;
  /** Names of the provider functions to remove. */
  names: string[];
}

export const PROVIDER_FUNCTION_REMOVALS_MIGRATION: ProviderFunctionRemovalInstruction[] = [
  // v49 to v51
  {
    module: /@(siemens|simpl)\/element-ng(\/icon)?/,
    names: ['provideIconConfig']
  }
];
