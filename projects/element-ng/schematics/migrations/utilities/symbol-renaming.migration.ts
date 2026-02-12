/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import * as ts from 'typescript';
import { EmitHint } from 'typescript';

import { findImportSpecifier } from '../../utils/index.js';
import { SymbolRenamingInstruction } from '../data/index.js';
import { ChangeInstruction, MigrationContext } from './migration.interface.js';

export const applySymbolRenamingMigration = (
  context: MigrationContext,
  changes: SymbolRenamingInstruction[]
): void => {
  const { discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile } = discoveredSourceFile;

  const changeInstructions = [
    ...renameIdentifier({
      sourceFile,
      renamingInstructions: changes
    })
  ];

  if (!changeInstructions.length) {
    return;
  }

  const printer = ts.createPrinter();

  for (const changeInstruction of changeInstructions) {
    recorder.remove(changeInstruction.start, changeInstruction.width);
    recorder.insertLeft(
      changeInstruction.start,
      printer.printNode(EmitHint.Unspecified, changeInstruction.newNode, sourceFile)
    );
  }
};

function* renameIdentifier({
  sourceFile,
  renamingInstructions
}: {
  sourceFile: ts.SourceFile;
  renamingInstructions: SymbolRenamingInstruction[];
}): Generator<ChangeInstruction> {
  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      continue;
    }

    for (const renamingInstruction of renamingInstructions) {
      if (!renamingInstruction.module.test(node.moduleSpecifier.text)) {
        continue;
      }

      if (
        !(node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings))
      ) {
        continue;
      }

      // Find all symbols from this import that need to be renamed/moved
      const symbolsToProcess: {
        importSpecifier: ts.ImportSpecifier;
        replace: string;
        replaceWith: string;
      }[] = [];

      for (const { replace, replaceWith } of renamingInstruction.symbolRenamings) {
        const importSpecifier = findImportSpecifier(
          node.importClause.namedBindings.elements,
          replace
        );

        if (importSpecifier) {
          symbolsToProcess.push({ importSpecifier, replace, replaceWith });
        }
      }

      if (symbolsToProcess.length === 0) {
        continue;
      }

      const hasMultipleImports = node.importClause.namedBindings.elements.length > 1;
      const allSymbolsBeingMigrated = symbolsToProcess.map(s => s.replace);
      const otherImportsNotBeingMigrated = node.importClause.namedBindings.elements.filter(
        el => !allSymbolsBeingMigrated.includes(el.name.text)
      );

      // Only split imports when they come from specific subpaths (e.g., '@simpl/element-ng/tabs').
      if (
        renamingInstruction.toModule &&
        hasMultipleImports &&
        otherImportsNotBeingMigrated.length > 0 &&
        !node.moduleSpecifier.text.endsWith('@simpl/element-ng')
      ) {
        // Split the import: keep non-migrated symbols in original import, move migrated symbols to new import

        // Replace the entire import with remaining imports
        const newImportClause = ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports(
            otherImportsNotBeingMigrated.map(el =>
              ts.factory.createImportSpecifier(false, el.propertyName, el.name)
            )
          )
        );

        const updatedImport = ts.factory.createImportDeclaration(
          undefined,
          newImportClause,
          node.moduleSpecifier
        );

        yield {
          start: node.getStart(),
          width: node.getWidth(),
          newNode: updatedImport
        };

        // Create new import with all migrated symbols (with their new names)
        const newImport = ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports(
              symbolsToProcess.map(({ replaceWith }) =>
                ts.factory.createImportSpecifier(
                  false,
                  undefined,
                  ts.factory.createIdentifier(replaceWith)
                )
              )
            )
          ),
          ts.factory.createStringLiteral(renamingInstruction.toModule, true)
        );

        yield {
          start: node.getEnd(),
          width: 0,
          newNode: ts.factory.createIdentifier(
            '\n' + ts.createPrinter().printNode(ts.EmitHint.Unspecified, newImport, sourceFile)
          )
        };
      } else if (
        renamingInstruction.toModule &&
        !node.moduleSpecifier.text.endsWith('@simpl/element-ng')
      ) {
        // All symbols in this import are being migrated, so update the module path and rename symbols
        for (const { importSpecifier, replaceWith } of symbolsToProcess) {
          yield {
            start: importSpecifier.name.getStart(),
            width: importSpecifier.name.getWidth(),
            newNode: ts.factory.createIdentifier(replaceWith)
          };
        }

        const newPath = node.moduleSpecifier.text.replace(
          renamingInstruction.module,
          renamingInstruction.toModule
        );

        yield {
          start: node.moduleSpecifier.getStart(),
          width: node.moduleSpecifier.getWidth(),
          newNode: ts.factory.createStringLiteral(newPath, true)
        };
      } else {
        // No module move, just rename the symbols in place
        for (const { importSpecifier, replaceWith } of symbolsToProcess) {
          yield {
            start: importSpecifier.name.getStart(),
            width: importSpecifier.name.getWidth(),
            newNode: ts.factory.createIdentifier(replaceWith)
          };
        }
      }

      // Create a visitor to rename all occurrences of the symbols in the file
      for (const { replace, replaceWith } of symbolsToProcess) {
        const visitor = function* (visitedNode: ts.Node): Generator<ChangeInstruction> {
          if (ts.isIdentifier(visitedNode) && visitedNode.text === replace) {
            yield {
              start: visitedNode.getStart(),
              width: visitedNode.getWidth(),
              newNode: ts.factory.createIdentifier(replaceWith)
            };
          } else {
            for (const child of visitedNode.getChildren()) {
              yield* visitor(child);
            }
          }
        };

        for (const statement of sourceFile.statements) {
          if (!ts.isImportDeclaration(statement)) {
            yield* visitor(statement);
          }
        }
      }
    }
  }
}
