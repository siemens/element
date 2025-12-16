/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

export interface ImportRemovalInstruction {
  /** Module that the symbol was removed from. */
  module: RegExp;
  /** Names of the symbols to be removed from imports. */
  symbolNames: string[];
}

/**
 * List of imports that should be removed during migration.
 */
export const IMPORT_REMOVALS_MIGRATION: ImportRemovalInstruction[] = [
  {
    module: /@(siemens|simpl)\/element-ng(\/common)?/,
    symbolNames: ['buildTrackByIdentity', 'buildTrackByIndex']
  }
];
