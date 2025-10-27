/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { RenameInstruction } from './ts-utils.js';

export interface ElementMigrationConfig {
  identifierRenameInstructions: RenameInstruction[];
  elementRenameInstructions: [from: string, to: string][];
  attributeRenameInstructions: [from: string, to: string][];
}
