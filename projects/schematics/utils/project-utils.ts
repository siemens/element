/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { JsonValue, normalize } from '@angular-devkit/core';
import {
  Action,
  DirEntry,
  FileEntry,
  FileVisitor,
  MergeStrategy,
  SchematicContext,
  Tree,
  UpdateRecorder
} from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import { join } from 'path';

export const getTsConfigPaths = async (options: {
  tree: Tree;
  context: SchematicContext;
}): Promise<string[]> => {
  const { tree } = options;
  const workspace = await readWorkspace(tree);
  const buildPaths = new Set<string>();
  // Iterate over all projects and their targets to find tsConfig paths for build and test
  for (const [, project] of workspace.projects) {
    for (const [name, target] of project.targets) {
      if (name !== 'build' && name !== 'test') {
        continue;
      }

      const tsConfig = target.options?.tsConfig;
      if (typeof tsConfig !== 'string' || !tree.exists(tsConfig)) {
        continue;
      }
      buildPaths.add(normalize(tsConfig));
    }
  }
  return [...buildPaths];
};

export const createFullPathTree = (basePath: string, tree: Tree): Tree => {
  const t: Tree = {
    branch: (): Tree => tree.branch(),
    merge: (other: Tree, strategy?: MergeStrategy): void => tree.merge(other, strategy),
    root: tree.root,
    read: (path: string): Buffer | null =>
      tree.read(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    readText: (path: string): string =>
      tree.readText(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    readJson: (path: string): JsonValue =>
      tree.readJson(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    exists: (path: string): boolean =>
      tree.exists(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    get: (path: string): FileEntry | null =>
      tree.get(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    getDir: (path: string): DirEntry =>
      tree.getDir(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    visit: (visitor: FileVisitor): void => {
      tree.visit((path, entry) => {
        visitor(normalize(join(basePath, path)), entry);
      });
    },
    overwrite: (path: string, content: Buffer | string): void =>
      tree.overwrite(normalize(path.replace(/\\/g, '/').replace(basePath, '')), content),
    beginUpdate: (path: string): UpdateRecorder =>
      tree.beginUpdate(normalize(path.replace(/\\/g, '/').replace(basePath, ''))),
    commitUpdate: (record: UpdateRecorder): void => {
      tree.commitUpdate(record);
    },
    create: (path: string, content: Buffer | string): void => {
      tree.create(normalize(path.replace(/\\/g, '/').replace(basePath, '')), content);
    },
    delete: (path: string): void => {
      tree.delete(normalize(path.replace(/\\/g, '/').replace(basePath, '')));
    },
    rename: (from: string, to: string): void => {
      tree.rename(
        normalize(from.replace(/\\/g, '/').replace(basePath, '')),
        normalize(to.replace(/\\/g, '/').replace(basePath, ''))
      );
    },
    apply: (action: Action, strategy?: MergeStrategy): void => {
      tree.apply(action, strategy);
    },
    actions: []
  };
  return t;
};

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
