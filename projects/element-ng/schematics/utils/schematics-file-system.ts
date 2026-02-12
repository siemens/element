/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { normalize } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';
import { relative } from 'path/posix';

export class SchematicsFileSystem {
  private readonly basePath = normalize(process.cwd());
  constructor(private tree: Tree) {}

  readonly readText = (path: string): string => {
    return this.tree.readText(normalize(relative(this.basePath, path)));
  };

  readonly exists = (path: string): boolean => {
    return this.tree.exists(normalize(relative(this.basePath, path)));
  };

  readonly getDir = (path: string): DirEntry => {
    return this.tree.getDir(normalize(relative(this.basePath, path)));
  };
}
