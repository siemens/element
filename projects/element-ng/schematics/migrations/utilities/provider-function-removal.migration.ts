/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import ts from 'typescript';

import { getImportSpecifiers } from '../../utils/index.js';
import { ProviderFunctionRemovalInstruction } from '../data/index.js';
import { removeImportSpecifiers } from './import-removal.js';
import { MigrationContext } from './migration.interface.js';

interface RemovalEdit {
  start: number;
  width: number;
  newNode?: ts.Node;
}

export const applyProviderFunctionRemovalMigration = (
  context: MigrationContext,
  changes: ProviderFunctionRemovalInstruction[]
): void => {
  const { discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile } = discoveredSourceFile;

  const edits: RemovalEdit[] = [];

  for (const change of changes) {
    const importSpecifiers = getImportSpecifiers(sourceFile, change.module, change.names);

    if (!importSpecifiers.length) {
      continue;
    }

    // Local names as they are used in the file (respecting import aliases).
    const localNames = new Set(importSpecifiers.map(specifier => specifier.name.text));

    const removedCall = collectArrayElementRemovals(sourceFile, localNames, edits);

    // Only remove the import if at least one call was actually removed from a provider array.
    if (removedCall) {
      // Group the matched specifiers by their import declaration so a single edit is
      // produced per declaration, even when multiple names are removed at once.
      const specifiersByImport = new Map<ts.ImportDeclaration, ts.ImportSpecifier[]>();
      for (const specifier of importSpecifiers) {
        const importDeclaration = specifier.parent.parent.parent;
        if (!ts.isImportDeclaration(importDeclaration)) {
          continue;
        }
        const existing = specifiersByImport.get(importDeclaration) ?? [];
        existing.push(specifier);
        specifiersByImport.set(importDeclaration, existing);
      }

      for (const [importDeclaration, specifiers] of specifiersByImport) {
        edits.push(removeImportSpecifiers(sourceFile, importDeclaration, specifiers));
      }
    }
  }

  if (!edits.length) {
    return;
  }

  const printer = ts.createPrinter();

  // Apply edits from bottom to top so earlier offsets stay valid.
  edits.sort((a, b) => b.start - a.start);

  for (const edit of edits) {
    recorder.remove(edit.start, edit.width);
    if (edit.newNode) {
      recorder.insertLeft(
        edit.start,
        printer.printNode(ts.EmitHint.Unspecified, edit.newNode, sourceFile)
      );
    }
  }
};

/**
 * Finds all call expressions of the given local names that appear as direct elements of
 * an array literal (e.g. a `providers: [...]` array) and records removal edits covering
 * the call together with its adjacent comma and surrounding whitespace.
 *
 * @returns `true` if at least one call was scheduled for removal.
 */
const collectArrayElementRemovals = (
  sourceFile: ts.SourceFile,
  localNames: Set<string>,
  edits: RemovalEdit[]
): boolean => {
  let removed = false;

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      localNames.has(node.expression.text) &&
      ts.isArrayLiteralExpression(node.parent)
    ) {
      edits.push(getArrayElementRemovalRange(sourceFile, node.parent, node));
      removed = true;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return removed;
};

/**
 * Computes the removal range for a single element of an array literal so that the
 * remaining array stays syntactically valid (no dangling commas).
 */
const getArrayElementRemovalRange = (
  sourceFile: ts.SourceFile,
  array: ts.ArrayLiteralExpression,
  element: ts.Node
): RemovalEdit => {
  const elements = array.elements;
  const index = elements.indexOf(element as ts.Expression);
  const text = sourceFile.getFullText();

  const elementStart = element.getStart(sourceFile);
  const elementEnd = element.getEnd();

  const isLast = index === elements.length - 1;

  if (!isLast) {
    // Remove up to (and including) the comma before the next element, plus the
    // whitespace that follows it.
    let end = elementEnd;
    while (end < text.length && text[end] !== ',') {
      end++;
    }
    // Skip the comma itself.
    if (text[end] === ',') {
      end++;
    }
    // Skip whitespace before the next element.
    while (end < text.length && /\s/.test(text[end])) {
      end++;
    }
    return { start: elementStart, width: end - elementStart };
  }

  // Last element: also remove the comma and whitespace that precede it, so the previous
  // element does not end up with a trailing comma.
  let start = elementStart;
  let cursor = elementStart - 1;
  while (cursor >= 0 && /\s/.test(text[cursor])) {
    cursor--;
  }
  if (cursor >= 0 && text[cursor] === ',') {
    start = cursor;
  }

  return { start, width: elementEnd - start };
};
