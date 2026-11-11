/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { cp, readFile, readdir, symlink } from 'node:fs/promises';
import path from 'node:path';

import { ignoredDirectories } from '../config';

export type SourceFiles = Record<string, string>;

export interface SourceChange {
  file: string;
  before?: string;
  after?: string;
}

export const sourceFiles = async (directory: string): Promise<SourceFiles> => {
  const files: SourceFiles = {};
  const visit = async (relative: string): Promise<void> => {
    for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
      const file = path.join(relative, entry.name);
      if (ignoredDirectories.includes(entry.name)) {
        continue;
      }
      if (entry.isDirectory()) {
        await visit(file);
      } else if (entry.isFile()) {
        files[file] = await readFile(path.join(directory, file), 'utf8');
      }
    }
  };
  await visit('');
  return files;
};

export const sourceChanges = (before: SourceFiles, after: SourceFiles): SourceChange[] =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .sort()
    .filter(file => before[file] !== after[file])
    .map(file => ({ file, before: before[file], after: after[file] }));

export const createWorkspace = async (fixture: string, directory: string): Promise<SourceFiles> => {
  await cp(fixture, directory, {
    recursive: true,
    filter: file => !ignoredDirectories.includes(path.basename(file))
  });
  await symlink(path.join(fixture, 'node_modules'), path.join(directory, 'node_modules'), 'dir');
  return sourceFiles(directory);
};
