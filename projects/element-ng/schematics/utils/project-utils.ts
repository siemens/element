/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonValue, normalize } from '@angular-devkit/core';
import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  allTargetOptions,
  allWorkspaceTargets,
  getWorkspace
} from '@schematics/angular/utility/workspace';
import { dirname, isAbsolute, relative, resolve } from 'path/posix';
import * as ts from 'typescript';

import { createTreeAwareCompilerHost } from './ts-compiler-host.js';
import { parseTsconfigFile } from './ts-utils.js';

export interface DiscoveredSourceFile {
  path: string;
  sourceFile: ts.SourceFile;
  typeChecker: ts.TypeChecker;
}

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

export async function* createPrograms(tree: Tree): AsyncGenerator<ts.Program> {
  const basePath = normalize(process.cwd());

  // Wrap the tree to force full paths since parsing the TypeScript config requires full paths.
  const tsConfigs = await getTsConfigPaths(tree);

  if (!tsConfigs.length) {
    throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
  }

  for (const configPath of tsConfigs) {
    const tsConfigPath = resolve(basePath, configPath);
    const config = parseTsconfigFile(tsConfigPath, dirname(tsConfigPath), tree);
    yield ts.createProgram({
      options: config.options,
      rootNames: config.fileNames,
      host: createTreeAwareCompilerHost(tree, config.options)
    });
  }
}

export async function* discoverSourceFiles(
  tree: Tree,
  context: SchematicContext,
  projectPath?: string,
  extension: string = '.ts'
): AsyncGenerator<DiscoveredSourceFile> {
  const basePath = normalize(process.cwd());

  const tsConfigs = await getTsConfigPaths(tree);

  if (!tsConfigs.length) {
    throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
  }

  context.logger.debug(`Found tsconfig files: ${tsConfigs.join(', ')}`);

  const normalizedProjectPath = projectPath
    ? normalize(isAbsolute(projectPath) ? projectPath : resolve(basePath, projectPath))
    : undefined;

  const emitted = new Set<string>();

  for await (const program of createPrograms(tree)) {
    const typeChecker = program.getTypeChecker();
    for (const sourceFile of program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) {
        continue;
      }

      const absolutePath = normalize(sourceFile.fileName);

      if (!absolutePath.endsWith(extension)) {
        continue;
      }

      if (normalizedProjectPath && !absolutePath.startsWith(normalizedProjectPath)) {
        continue;
      }

      const relativePath = normalize(relative(basePath, absolutePath));

      if (!tree.exists(relativePath)) {
        continue;
      }

      if (emitted.has(relativePath)) {
        continue;
      }

      emitted.add(relativePath);

      yield {
        path: relativePath,
        sourceFile,
        typeChecker
      };
    }
  }
}
