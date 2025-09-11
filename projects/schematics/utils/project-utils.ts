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
  SchematicContext,
  SchematicsException,
  Tree,
  UpdateRecorder
} from '@angular-devkit/schematics';
import { dirname, isAbsolute, join, resolve } from 'path';

import { parseTsconfigFile } from './ts-utils';

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

export const discoverSourceFiles = (
  tree: Tree,
  context: SchematicContext,
  projectPath?: string,
  extension: string = '.ts'
): string[] => {
  const basePath = process.cwd().replace(/\\/g, '/');

  // Wrap the tree to force full paths since parsing the typescript config requires full paths.
  const tsTree = createFullPathTree(basePath, tree);
  const tsConfigs = getTsConfigPaths(tree);

  if (!tsConfigs.length) {
    throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
  }

  context.logger.debug(`Found tsconfig files: ${tsConfigs.join(', ')}`);
  let sourceFiles: string[] = [];
  for (const configPath of tsConfigs) {
    const tsConfigPath = resolve(basePath, configPath);
    const config = parseTsconfigFile(tsConfigPath, dirname(tsConfigPath), tsTree);
    sourceFiles.push(...config.fileNames.filter(f => f.endsWith(extension)));
  }

  // Filter all files which are in the path
  if (projectPath) {
    sourceFiles = isAbsolute(projectPath)
      ? sourceFiles.filter(f => f.startsWith(projectPath))
      : sourceFiles.filter(f => f.startsWith(resolve(basePath, projectPath)));
  }

  return Array.from(new Set(sourceFiles)).map(p => p.substring(basePath.length + 1));
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
