/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { normalize } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';

export const getAllTypeScriptFiles = (path: string, tree: Tree): string[] => {
  const files: string[] = [];
  visitDirectory(tree, path, files);
  return files;
};

const visitDirectory = (tree: Tree, dirPath: string, files: string[]): void => {
  const entries = tree.getDir(dirPath);

  entries.subfiles.forEach(filename => {
    if (filename.endsWith('.ts') && !filename.endsWith('.d.ts')) {
      const fullPath = normalize(`${dirPath}/${filename}`);
      files.push(fullPath);
    }
  });

  entries.subdirs.forEach(subdirname => {
    visitDirectory(tree, `${dirPath}/${subdirname}`, files);
  });
};
