/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { normalize } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'path/posix';
import * as ts from 'typescript';

export const createTreeAwareCompilerHost = (
  tree: Tree,
  options: ts.CompilerOptions
): ts.CompilerHost => {
  const host = ts.createCompilerHost(options, true);
  const basePath = normalize(process.cwd());

  const toAbsolutePath = (targetPath: string): string => {
    return isAbsolute(targetPath) ? targetPath : resolve(basePath, targetPath);
  };

  const toTreePath = (targetPath: string): string | null => {
    const absolutePath = toAbsolutePath(targetPath);
    const relativePath = relative(basePath, absolutePath);
    if (relativePath.startsWith('..')) {
      return null;
    }
    if (!relativePath || relativePath === '.') {
      return '';
    }
    return normalize(relativePath);
  };

  host.fileExists = (path: string): boolean => {
    const treePath = toTreePath(path);
    if (treePath && tree.exists(treePath)) {
      return true;
    }
    return existsSync(toAbsolutePath(path));
  };

  host.readFile = path => {
    const treePath = toTreePath(path);
    if (treePath && tree.exists(treePath)) {
      return tree.readText(treePath);
    }
    const absolutePath = toAbsolutePath(path);
    if (existsSync(absolutePath)) {
      return readFileSync(absolutePath, 'utf-8');
    }
    return undefined;
  };

  host.directoryExists = path => {
    const treePath = toTreePath(path);
    if (treePath) {
      const dir = tree.getDir(treePath);
      if (dir.subfiles.length || dir.subdirs.length) {
        return true;
      }
    }
    return ts.sys.directoryExists(toAbsolutePath(path));
  };

  host.readDirectory = (path, extensions, exclude, include, depth) => {
    const absolutePath = toAbsolutePath(path);
    const entries = new Set<string>(
      ts.sys.readDirectory(absolutePath, extensions, exclude, include, depth)
    );

    const treePath = toTreePath(path);
    if (treePath !== null) {
      const treeDir = tree.getDir(treePath);
      treeDir.subfiles.forEach(subfile => {
        entries.add(resolve(absolutePath, subfile));
      });
      treeDir.subdirs.forEach(subdir => {
        entries.add(resolve(absolutePath, subdir));
      });
    }

    return Array.from(entries);
  };

  return host;
};
