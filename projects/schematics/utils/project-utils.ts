/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { JsonValue, normalize, workspaces } from '@angular-devkit/core';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace/definitions';
import {
  Action,
  DirEntry,
  FileEntry,
  FileVisitor,
  MergeStrategy,
  SchematicsException,
  Tree,
  UpdateRecorder
} from '@angular-devkit/schematics';
import { join } from 'path';

export const getWorkspace = (tree: Tree): workspaces.WorkspaceDefinition => {
  const workspace = tree.read('/angular.json');
  if (!workspace) {
    throw new SchematicsException('Could not find angular.json');
  }

  return JSON.parse(workspace.toString());
};

export const getTsConfigPaths = (tree: Tree): string[] => {
  const buildPaths = new Set<string>();

  for (const target of getTargets(getWorkspace(tree))) {
    if (target.options?.tsConfig && typeof target.options.tsConfig === 'string') {
      const tsConfig = target.options.tsConfig;
      if (tree.exists(tsConfig)) {
        buildPaths.add(normalize(tsConfig));
      }
    }
  }

  return [...buildPaths];
};

export const getGlobalStyles = (tree: Tree): string[] => {
  const globalStyles = new Set<string>();

  for (const target of getTargets(getWorkspace(tree))) {
    if (target.options?.styles && Array.isArray(target.options.styles)) {
      target.options.styles.forEach((style: JsonValue) => {
        if (typeof style === 'string') {
          globalStyles.add(normalize(style));
        }
      });
    }
  }

  return [...globalStyles];
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

function* getTargets(
  workspace: workspaces.WorkspaceDefinition,
  targetNames: string[] = ['build', 'test']
): Generator<workspaces.TargetDefinition> {
  for (const [, projectRaw] of Object.entries(workspace.projects)) {
    const project = projectRaw as Record<string, ProjectDefinition>;
    if (!project.architect) {
      continue;
    }
    for (const [name, target] of Object.entries(project.architect)) {
      if (targetNames.includes(name) && target) {
        yield target;
      }
    }
  }
}
