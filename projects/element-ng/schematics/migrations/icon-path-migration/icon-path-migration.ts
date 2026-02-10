/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import {
  addPackageJsonDependency,
  NodeDependencyType,
  removePackageJsonDependency
} from '@schematics/angular/utility/dependencies';
import * as ts from 'typescript';

import { discoverSourceFiles } from '../../utils/index.js';

/**
 * Migration rule to update icon imports from \@simpl/element-ng to \@siemens/element-icons
 * and \@simpl/element-icons style imports to \@siemens/element-icons.
 */
export const iconPathMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating icon paths...');
    return chain([
      migrateTypeScriptImports(options),
      migrateStyleImports(),
      updatePackageJsonDeps()
    ])(tree, context);
  };
};

/**
 * Migrates TypeScript imports from \@simpl/element-ng/ionic and \@simpl/element-ng/svg
 * to \@siemens/element-icons
 */
const migrateTypeScriptImports = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    for await (const { path: filePath, sourceFile } of discoverSourceFiles(
      tree,
      context,
      options.path
    )) {
      const recorder = tree.beginUpdate(filePath);
      let hasChanges = false;

      for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
          continue;
        }

        const moduleSpecifier = statement.moduleSpecifier.text;

        // Check if this is an import from @simpl/element-ng/ionic or @simpl/element-ng/svg
        if (
          moduleSpecifier === '@simpl/element-ng/ionic' ||
          moduleSpecifier === '@simpl/element-ng/svg'
        ) {
          // Replace the module specifier with @siemens/element-icons
          const start = statement.moduleSpecifier.getStart(sourceFile) + 1; // +1 to skip opening quote
          const end = statement.moduleSpecifier.getEnd() - 1; // -1 to skip closing quote
          const length = end - start;

          recorder.remove(start, length);
          recorder.insertLeft(start, '@siemens/element-icons');
          hasChanges = true;
        }
      }

      if (hasChanges) {
        tree.commitUpdate(recorder);
      }
    }

    context.logger.info('✅ TypeScript icon imports migrated');
    return tree;
  };
};

/**
 * Migrates SCSS/SASS imports from \@simpl/element-icons to \@siemens/element-icons
 */
const migrateStyleImports = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    tree.visit(filePath => {
      if (
        !filePath.endsWith('.scss') &&
        !filePath.endsWith('.sass') &&
        !filePath.endsWith('.css')
      ) {
        return;
      }

      const content = tree.readText(filePath);
      if (!content) {
        return;
      }

      const updatedContent = content
        .replace(
          /@use\s+['"]@simpl\/element-icons\/dist\/style\/simpl-element-icons['"]/g,
          "@use '@siemens/element-icons/dist/style/siemens-element-icons'"
        )
        .replace(
          /@import\s+['"]@simpl\/element-icons\/dist\/style\/simpl-element-icons['"]/g,
          "@import '@siemens/element-icons/dist/style/siemens-element-icons'"
        );

      if (content !== updatedContent) {
        tree.overwrite(filePath, updatedContent);
      }
    });

    context.logger.info('✅ Style icon imports migrated');
    return tree;
  };
};

const updatePackageJsonDeps = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@siemens/element-icons',
      version: '^1.0.0',
      overwrite: true
    });
    removePackageJsonDependency(tree, '@simpl/element-icons');

    context.logger.info('✅ Package dependencies updated');
    return tree;
  };
};
