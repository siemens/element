/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
// import { findNodes } from '@schematics/angular/utility/ast-utils';
// import { applyToUpdateRecorder, ReplaceChange } from '@schematics/angular/utility/change';
// import { getEOL } from '@schematics/angular/utility/eol';
// import * as ts from 'typescript';
import { dirname, resolve } from 'path';

import { createFullPathTree, getTsConfigPaths } from '../utils';
import { parseTsconfigFile } from '../utils/ts-utils';

interface MigrationOptions {
  path: string;
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function siemensMigration(_options: MigrationOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');
    const basePath = process.cwd().replace(/\\/g, '/');
    const tsConfigs = await getTsConfigPaths({ tree, context });
    if (!tsConfigs.length) {
      throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
    }
    const sourceFiles: string[] = [];
    // Wrap the tree to force full paths since typescript expect them
    const tsTree = createFullPathTree(basePath, tree);
    for (const configPath of tsConfigs) {
      const tsConfigPath = resolve(basePath, configPath);
      const config = parseTsconfigFile(tsConfigPath, dirname(tsConfigPath), tsTree);
      sourceFiles.push(...config.fileNames.filter(f => f.endsWith('.ts')));
    }
    console.log('Source files:', sourceFiles);
    // const files = getAllTypeScriptFiles(_options.path, tree);
    // files.forEach(filePath => {
    //   const content = tree.read(filePath);
    //   if (!content) {
    //     return false;
    //   }

    // files.forEach(filePath => {
    //   const content = tree.read(filePath);
    //   if (!content) {
    //     return false;
    //   }

    //   const sourceFile = ts.createSourceFile(
    //     filePath,
    //     content.toString(),
    //     ts.ScriptTarget.Latest,
    //     true
    //   );

    // const allImports = findNodes(
    //   sourceFile,
    //   ts.SyntaxKind.ImportDeclaration
    // ) as ts.ImportDeclaration[];

    // const relevantImportNodes = allImports.filter(
    //   node =>
    //     node.moduleSpecifier &&
    //     ts.isStringLiteral(node.moduleSpecifier) &&
    //     node.moduleSpecifier.text.startsWith('@simpl/')
    // );

    // // Remove all relevant @simpl/ import statements
    // const recorder = tree.beginUpdate(filePath);
    // relevantImportNodes.forEach(node => {
    //   // Extract all imported component names or module names from @simpl/ imports
    //   const imports =
    //     node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
    //       ? node.importClause.namedBindings.elements
    //       : [];

    //   const symbolNames = imports.map(e => e.name.getText());

    //   const newImportPath = '@siemens/element-ng';

    //   if (!newImportPath) {
    //     context.logger.warn(`No new import path found for component: ${symbolNames}`);
    //     return;
    //   }

    //       const eol = getEOL(sourceFile.getText());
    //       const newImport = `import { ${symbolNames.join(', ')} } from '${newImportPath}';${eol}`;
    //       applyToUpdateRecorder(recorder, [
    //         new ReplaceChange(filePath, node.getStart(), node.getFullText(), newImport)
    //       ]);

    //       //     // Alternative 2: Replace the import path directly
    //       //     // const newPackagePath = findPackageImportPath(node.moduleSpecifier.text);
    //       //     // if (newPackagePath) {
    //       //     //   recorder.remove(node.moduleSpecifier.getStart(), node.moduleSpecifier.getWidth());
    //       //     //   recorder.insertLeft(node.moduleSpecifier.getStart(), `'${newPackagePath}'`);
    //       //     // }
    //       //   }
    //       // });
    //     });
    //     tree.commitUpdate(recorder);
    //   } catch (error) {
    //     context.logger.error(`Could not process ${filePath}: ${error}`);
    //   }
    // });

    context.logger.info('✅ Simpl to Siemens migration completed!');
    return tree;
  };
}
