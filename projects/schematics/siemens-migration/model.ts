/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import * as ts from 'typescript';

export interface MigrationOptions {
  path: string;
}

export type Imports = Map<string, string[]>;

export type Migrations = {
  imports: Imports;
  toRemoveImports: ts.ImportDeclaration[];
};
