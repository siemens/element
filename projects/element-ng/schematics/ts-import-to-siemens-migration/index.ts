/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree, SchematicContext, Rule, chain } from '@angular-devkit/schematics';
import * as ts from 'typescript';

import { getImportNodes, getSymbols, discoverSourceFiles } from '../utils/index.js';
import {
  CHARTS_NG_MAPPINGS,
  DASHBOARDS_NG_MAPPINGS,
  ELEMENT_NG_MAPPINGS,
  ELEMENT_TRANSLATE_NG_MAPPINGS,
  MAPS_NG_MAPPINGS
} from './mappings/index.js';
import { Migrations } from './model.js';

export const tsImportMigration = (_options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');
    return tsImportMigrationRule(_options)(tree, context);
  };
};

/**
 * Creates a migration rule that updates import statements in TypeScript files.
 *
 * This rule discovers source files, analyzes their import statements, and applies
 * necessary transformations to migrate imports according to the specified options.
 * It processes each file individually and chains all the resulting rules together.
 *
 * @param _options - Configuration options for the migration process
 * @returns A Rule function that can be executed by Angular Schematics
 *
 * @example
 * ```typescript
 * const migrationRule = tsImportMigrationRule({ path: 'some-path' });
 * ```
 */
export const tsImportMigrationRule = (_options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    context.logger.info('📦 Migrating TypeScript imports...');
    const sourceFiles = await discoverSourceFiles(tree, context, _options.path);

    for (const filePath of sourceFiles) {
      const migrations = collectMigrationImports(filePath, tree, context);
      const { imports, toRemoveImports } = migrations;

      if (imports.size === 0 && toRemoveImports.length === 0) {
        continue;
      }

      const rule = rewriteImportsInFile(filePath, migrations);
      rules.push(rule);
    }

    return chain([...rules]);
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

const findComponentImportPath = (
  symbolName: string,
  moduleSpecifier: string
): string | undefined => {
  const [, project, subPath] = moduleSpecifier.split('/');

  switch (project) {
    case 'element-ng': {
      // Special case for MenuItem from menu package as it has conflicting name with MenuItem from common package
      if (symbolName === 'MenuItem' && subPath === 'menu') {
        return '@siemens/element-ng/menu';
      }
      // Added the OR condition to check in ELEMENT_TRANSLATE_NG_MAPPINGS as well because translation are also part of `@simpl/element-ng` imports
      return ELEMENT_NG_MAPPINGS[symbolName] || ELEMENT_TRANSLATE_NG_MAPPINGS[symbolName];
    }
    case 'maps-ng':
      return MAPS_NG_MAPPINGS[symbolName];
    case 'dashboards-ng':
      return DASHBOARDS_NG_MAPPINGS[symbolName];
    case 'charts-ng':
      return CHARTS_NG_MAPPINGS[symbolName];
    case 'element-translate-ng':
      return ELEMENT_TRANSLATE_NG_MAPPINGS[symbolName];
    default:
      return undefined;
  }
};
