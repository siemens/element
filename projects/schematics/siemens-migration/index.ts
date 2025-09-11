/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { dirname, isAbsolute, resolve } from 'path';
import * as ts from 'typescript';

import {
  getTsConfigPaths,
  getImportNodes,
  getSymbols,
  createFullPathTree,
  parseTsconfigFile
} from '../utils';
import { findComponentImportPath } from './mappings';
import { MigrationOptions, Migrations } from './model';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export const siemensMigration = (_options: MigrationOptions): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');

    const sourceFiles = discoverSourceFiles(tree, context, _options);
    const rules: Rule[] = [];

    for (const filePath of sourceFiles) {
      const migrations = collectMigrationImports(filePath, tree, context);
      const { imports, toRemoveImports } = migrations;

      if (imports.size === 0 && toRemoveImports.length === 0) {
        continue;
      }

      const rule = rewriteImportsInFile(filePath, migrations);
      rules.push(rule);
    }

    const chainedRules = chain([...rules]);
    context.logger.info('✅ Simpl to Siemens migration completed!');
    return chainedRules(tree, context);
  };
};

const collectMigrationImports = (
  filePath: string,
  tree: Tree,
  _context: SchematicContext
): Migrations => {
  const content = tree.read(filePath);
  const imports = new Map<string, string[]>();

  if (!content) {
    return { imports, toRemoveImports: [] };
  }

  const simplImports = getImportNodes(filePath, content.toString(), '@simpl/');
  const toRemoveImports: ts.ImportDeclaration[] = [];

  for (const node of simplImports) {
    const symbols = getSymbols(node);
    const importPath = node.moduleSpecifier.getText().replace(/['"]/g, '');
    let toRemove = false;
    for (const symbol of symbols) {
      const symbolName = symbol.name.getText();
      const newImportPath = findComponentImportPath(symbolName, importPath);
      if (!newImportPath) {
        continue;
      }

      toRemove = true;
      const migration = imports.get(newImportPath);
      if (!migration) {
        imports.set(newImportPath, [symbolName]);
      } else {
        migration.push(symbolName);
      }
    }

    if (toRemove) {
      toRemoveImports.push(node);
    }
  }

  return { imports, toRemoveImports };
};

const rewriteImportsInFile = (filePath: string, migrations: Migrations): Rule => {
  return (tree: Tree): Tree => {
    const recorder = tree.beginUpdate(filePath);
    const start = migrations.toRemoveImports.at(0)?.getFullStart() ?? 0;

    // Remove old imports
    for (const importDecl of migrations.toRemoveImports) {
      recorder.remove(importDecl.getFullStart(), importDecl.getFullWidth());
    }

    // Add new imports
    const importPaths = Array.from(migrations.imports.keys()).sort((a, b) => a.localeCompare(b));

    for (const path of importPaths) {
      const symbols = migrations.imports.get(path)!;
      recorder.insertLeft(
        start,
        `\nimport { ${symbols.sort((a, b) => a.localeCompare(b)).join(', ')} } from '${path}';`
      );
    }

    tree.commitUpdate(recorder);
    return tree;
  };
};

const discoverSourceFiles = (
  tree: Tree,
  context: SchematicContext,
  options: MigrationOptions
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
    sourceFiles.push(...config.fileNames.filter(f => f.endsWith('.ts')));
  }

  // Filter all files which are in the path
  if (options.path) {
    sourceFiles = isAbsolute(options.path)
      ? sourceFiles.filter(f => f.startsWith(options.path))
      : sourceFiles.filter(f => f.startsWith(resolve(basePath, options.path)));
  }

  return Array.from(new Set(sourceFiles)).map(path => path.substring(basePath.length + 1));
};
