/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import ts from 'typescript';

/**
 * Describes an edit that removes one or more named import specifiers from an import
 * declaration.
 *
 * - When `newNode` is `undefined`, the range should be removed without any
 *   replacement (the whole import declaration is dropped).
 * - Otherwise the range should be replaced with the printed `newNode` (the import
 *   declaration rebuilt without the removed specifiers).
 */
export interface ImportRemovalEdit {
  start: number;
  width: number;
  newNode?: ts.Node;
}

/**
 * Builds an edit that removes the given named import specifiers from an import
 * declaration.
 *
 * If no specifiers remain after the removal, the whole import declaration is removed
 * (including its trailing newline). Otherwise the import is rebuilt without the removed
 * specifiers while preserving the remaining specifiers and their aliases.
 */
export const removeImportSpecifiers = (
  sourceFile: ts.SourceFile,
  importDeclaration: ts.ImportDeclaration,
  specifiers: ts.ImportSpecifier[]
): ImportRemovalEdit => {
  const namedBindings = importDeclaration.importClause?.namedBindings;

  const remainingElements =
    namedBindings && ts.isNamedImports(namedBindings)
      ? namedBindings.elements.filter(element => !specifiers.includes(element))
      : [];

  if (remainingElements.length === 0) {
    // No named binding remains: remove the whole import declaration including the
    // trailing newline so no empty line is left behind.
    const start = importDeclaration.getStart(sourceFile);
    let end = importDeclaration.getEnd();
    const fullText = sourceFile.getFullText();
    if (fullText[end] === '\r') {
      end++;
    }
    if (fullText[end] === '\n') {
      end++;
    }

    return { start, width: end - start };
  }

  const updatedImport = ts.factory.createImportDeclaration(
    importDeclaration.modifiers,
    ts.factory.createImportClause(
      importDeclaration.importClause!.isTypeOnly,
      importDeclaration.importClause!.name,
      ts.factory.createNamedImports(
        remainingElements.map(element =>
          ts.factory.createImportSpecifier(element.isTypeOnly, element.propertyName, element.name)
        )
      )
    ),
    importDeclaration.moduleSpecifier,
    importDeclaration.attributes
  );

  return {
    start: importDeclaration.getStart(sourceFile),
    width: importDeclaration.getWidth(sourceFile),
    newNode: updatedImport
  };
};
