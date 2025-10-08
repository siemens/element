/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { normalize, workspaces } from '@angular-devkit/core';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace/definitions';
import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { dirname, isAbsolute, resolve } from 'path';

import { parseTsconfigFile } from './ts-utils.js';

export const getWorkspace = (tree: Tree): Record<string, any> => {
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

export const discoverSourceFiles = (
  tree: Tree,
  context: SchematicContext,
  projectPath?: string,
  extension: string = '.ts'
): string[] => {
  const basePath = normalize(process.cwd());

  // Wrap the tree to force full paths since parsing the typescript config requires full paths.
  const tsConfigs = getTsConfigPaths(tree);

  if (!tsConfigs.length) {
    throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
  }

  context.logger.debug(`Found tsconfig files: ${tsConfigs.join(', ')}`);
  let sourceFiles: string[] = [];
  for (const configPath of tsConfigs) {
    const tsConfigPath = resolve(basePath, configPath);
    const config = parseTsconfigFile(tsConfigPath, dirname(tsConfigPath), tree);
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
  workspace: Record<string, any>,
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
