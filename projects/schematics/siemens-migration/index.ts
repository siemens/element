/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { findNodes } from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';

import { getAllTypeScriptFiles } from '../utils';

interface MigrationOptions {
  path: string;
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function siemensMigration(_options: MigrationOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.logger.info('🚀 Starting Simpl to Siemens migration...');

    // const files = getAllTypeScriptFiles(_options.path, tree);
    // files.forEach(filePath => {
    //   const content = tree.read(filePath);
    //   if (!content) {
    //     return false;
    //   }

    //   try {
    //     const sourceFile = ts.createSourceFile(
    //       filePath,
    //       content.toString(),
    //       ts.ScriptTarget.Latest,
    //       true
    //     );

    //     const allImports = findNodes(
    //       sourceFile,
    //       ts.SyntaxKind.ImportDeclaration
    //     ) as ts.ImportDeclaration[];

    //     const relevantImportNodes = allImports.filter(
    //       node =>
    //         node.moduleSpecifier &&
    //         ts.isStringLiteral(node.moduleSpecifier) &&
    //         node.moduleSpecifier.text.startsWith('@simpl/')
    //     );

    //     // Remove all relevant @simpl/ import statements
    //     const recorder = tree.beginUpdate(filePath);

    //     relevantImportNodes.forEach(node => {
    //       // Extract all imported component names or module names from @simpl/ imports
    //       const imports =
    //         node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
    //           ? node.importClause.namedBindings.elements
    //           : [];

    //       const symbolNames = imports.map(e => e.name.getText());

    //       const newImportPath = findComponentImportPath(symbolNames[0]);

    //       if (!newImportPath) {
    //         this.context.logger.warn(`No new import path found for component: ${symbolNames}`);
    //         return;
    //       }

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

    _context.logger.info('✅ Simpl to Siemens migration completed!');
    return tree;
  };
}
