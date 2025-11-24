/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree, SchematicContext, Rule, chain, UpdateRecorder } from '@angular-devkit/schematics';
import { getDecoratorMetadata, getMetadataField } from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';

import { getImportNodes, getSymbols, discoverSourceFiles } from '../utils/index.js';
import {
  CHARTS_NG_MAPPINGS,
  DASHBOARDS_NG_MAPPINGS,
  ELEMENT_NG_MAPPINGS,
  ELEMENT_TRANSLATE_NG_MAPPINGS,
  MAPS_NG_MAPPINGS,
  SIMPL_ELEMENT_NG_MODULES
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
      const { imports, toRemoveImports, hasSimplElementNgModuleImport } = migrations;

      if (
        imports.size === 0 &&
        toRemoveImports.length === 0 &&
        hasSimplElementNgModuleImport === false
      ) {
        continue;
      }

      const rule = rewriteImportsInFile(filePath, migrations);
      rules.push(rule);
    }

    return chain([...rules]);
  };
};

/**
 * Adds a symbol to the imports map, avoiding duplicates
 */
const addSymbolToImports = (
  imports: Map<string, string[]>,
  importPath: string,
  symbolName: string
): void => {
  const existingSymbols = imports.get(importPath);
  if (!existingSymbols) {
    imports.set(importPath, [symbolName]);
  } else if (!existingSymbols.includes(symbolName)) {
    existingSymbols.push(symbolName);
  }
};

const collectMigrationImports = (
  filePath: string,
  tree: Tree,
  _context: SchematicContext
): Migrations => {
  const content = tree.read(filePath);
  const imports = new Map<string, string[]>();
  let hasSimplElementNgModuleImport = false;

  if (!content) {
    return {
      imports,
      toRemoveImports: [],
      hasSimplElementNgModuleImport
    };
  }

  const simplImports = getImportNodes(filePath, content.toString(), '@simpl/');
  const toRemoveImports: ts.ImportDeclaration[] = [];

  for (const node of simplImports) {
    const symbols = getSymbols(node);
    const importPath = node.moduleSpecifier.getText().replace(/['"]/g, '');
    let shouldRemoveImport = false;
    for (const symbol of symbols) {
      const symbolName = symbol.name.getText();

      if (symbolName === 'SimplElementNgModule') {
        hasSimplElementNgModuleImport = true;

        for (const moduleName of SIMPL_ELEMENT_NG_MODULES) {
          const newImportPath = findComponentImportPath(moduleName, '@simpl/element-ng');
          if (!newImportPath) {
            continue;
          }
          shouldRemoveImport = true;
          addSymbolToImports(imports, newImportPath, moduleName);
        }
      } else {
        const newImportPath = findComponentImportPath(symbolName, importPath);
        if (!newImportPath) {
          continue;
        }

        shouldRemoveImport = true;
        addSymbolToImports(imports, newImportPath, symbolName);
      }
    }

    if (shouldRemoveImport) {
      toRemoveImports.push(node);
    }
  }

  return { imports, toRemoveImports, hasSimplElementNgModuleImport };
};

const rewriteImportsInFile = (filePath: string, migrations: Migrations): Rule => {
  return (tree: Tree): Tree => {
    const recorder = tree.beginUpdate(filePath);
    const insertPosition = migrations.toRemoveImports.at(0)?.getFullStart() ?? 0;

    const content = tree.read(filePath);
    if (!content) {
      return tree;
    }

    const sourceFile = ts.createSourceFile(
      filePath,
      content.toString(),
      ts.ScriptTarget.Latest,
      true
    );

    // Remove old imports
    removeOldImports(recorder, migrations.toRemoveImports);

    // Add new imports
    addNewImports(recorder, migrations.imports, insertPosition, sourceFile);

    // Update NgModule/Component imports array if needed
    if (migrations.hasSimplElementNgModuleImport) {
      updateDecoratorImports(recorder, sourceFile);
    }

    tree.commitUpdate(recorder);
    return tree;
  };
};

const updateDecoratorImports = (recorder: UpdateRecorder, sourceFile: ts.SourceFile): void => {
  const decoratorNames = ['NgModule', 'Component'];
  let decoratorNode: ts.Node | undefined;

  // Try to find NgModule or Component decorator
  for (const decoratorName of decoratorNames) {
    const nodes = getDecoratorMetadata(sourceFile, decoratorName, '@angular/core');
    if (nodes.length > 0) {
      decoratorNode = nodes[0];
      break;
    }
  }

  if (!decoratorNode || !ts.isObjectLiteralExpression(decoratorNode)) {
    return;
  }

  const matchingProperties = getMetadataField(decoratorNode, 'imports');
  const importsAssignment = matchingProperties[0];

  if (
    !ts.isPropertyAssignment(importsAssignment) ||
    !ts.isArrayLiteralExpression(importsAssignment.initializer)
  ) {
    return;
  }

  const elements = importsAssignment.initializer.elements;

  // Filter out SimplElementNgModule and get existing modules
  const existingModules = elements
    .filter(e => e.getText() !== 'SimplElementNgModule')
    .map(e => e.getText());

  const existingModulesSet = new Set(existingModules);

  // Only add modules that don't already exist
  const newModulesToAdd = SIMPL_ELEMENT_NG_MODULES.filter(m => !existingModulesSet.has(m));

  // Combine existing (without SimplElementNgModule) + new modules
  const allModules = [...existingModules, ...newModulesToAdd];

  // Remove existing imports array
  recorder.remove(importsAssignment.getFullStart(), importsAssignment.getFullWidth());

  // Create and insert the updated property assignment

  const printer = ts.createPrinter();
  const newNode = ts.factory.createArrayLiteralExpression(
    allModules.map(m => ts.factory.createIdentifier(m)),
    true
  );

  const newProperty = ts.factory.updatePropertyAssignment(
    importsAssignment,
    importsAssignment.name,
    newNode
  );

  const propertyText = printer.printNode(ts.EmitHint.Unspecified, newProperty, sourceFile);
  // Had to add extra indentation to align properly
  recorder.insertLeft(importsAssignment.getStart(), `\n  ` + propertyText);
};

/**
 * Removes old import declarations from the file
 */
const removeOldImports = (
  recorder: UpdateRecorder,
  toRemoveImports: ts.ImportDeclaration[]
): void => {
  for (const importDecl of toRemoveImports) {
    recorder.remove(importDecl.getFullStart(), importDecl.getFullWidth());
  }
};

/**
 * Adds new import declarations to the file
 */
const addNewImports = (
  recorder: UpdateRecorder,
  imports: Map<string, string[]>,
  insertPosition: number,
  sourceFile: ts.SourceFile
): void => {
  const sortedImportPaths = Array.from(imports.keys()).sort((a, b) => a.localeCompare(b));

  const printer = ts.createPrinter();
  let counter = 0;
  for (const path of sortedImportPaths) {
    const symbols = imports.get(path)!;
    const sortedSymbols = symbols.sort((a, b) => a.localeCompare(b));
    const importDeclaration = createImportDeclaration(path, sortedSymbols);
    const importStatement = printer.printNode(
      ts.EmitHint.Unspecified,
      importDeclaration,
      sourceFile
    );
    const prefix = insertPosition === 0 && counter === 0 ? '' : '\n';
    recorder.insertLeft(insertPosition, `${prefix}${importStatement}`);
    counter++;
  }
};

/**
 * Creates import declarations using TypeScript AST
 */
const createImportDeclaration = (importPath: string, symbols: string[]): ts.ImportDeclaration => {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        symbols.map(symbol =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(symbol))
        )
      )
    ),
    ts.factory.createStringLiteral(importPath, true)
  );
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
