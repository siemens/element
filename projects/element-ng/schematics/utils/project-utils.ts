/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { JsonValue, normalize } from '@angular-devkit/core';
import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  allTargetOptions,
  allWorkspaceTargets,
  getWorkspace
} from '@schematics/angular/utility/workspace';
import { dirname, isAbsolute, resolve } from 'path';

import { parseTsconfigFile } from './ts-utils.js';

export const getGlobalStyles = async (tree: Tree): Promise<string[]> => {
  const globalStyles = new Set<string>();

  for (const [name, target] of allWorkspaceTargets(await getWorkspace(tree))) {
    if (['build', 'test'].includes(name)) {
      for (const [, opt] of allTargetOptions(target)) {
        if (opt.styles && Array.isArray(opt.styles)) {
          opt.styles.forEach((style: JsonValue) => {
            if (typeof style === 'string') {
              globalStyles.add(normalize(style));
            }
          });
        }
      }
    }
  }

  return [...globalStyles];
};

export const getTsConfigPaths = async (tree: Tree): Promise<string[]> => {
  const buildPaths = new Set<string>();

  for (const [name, target] of allWorkspaceTargets(await getWorkspace(tree))) {
    if (['build', 'test'].includes(name)) {
      for (const [, opt] of allTargetOptions(target)) {
        if (typeof opt?.tsConfig === 'string') {
          const tsConfig = opt.tsConfig;
          if (tree.exists(tsConfig)) {
            buildPaths.add(normalize(tsConfig));
          }
        }
      }
    }
  }

  return [...buildPaths];
};

export const discoverSourceFiles = async (
  tree: Tree,
  context: SchematicContext,
  projectPath?: string,
  extension: string = '.ts'
): Promise<string[]> => {
  const basePath = normalize(process.cwd());

  // Wrap the tree to force full paths since parsing the typescript config requires full paths.
  const tsConfigs = await getTsConfigPaths(tree);

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
