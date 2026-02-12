/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { UpdateRecorder } from '@angular-devkit/schematics';
import ts from 'typescript';

import { ClassMemberReplacementInstruction } from '../data/index.js';
import { MigrationContext, Replacement } from './migration.interface.js';

export const applyClassMemberReplacementMigration = (
  context: MigrationContext,
  changes: ClassMemberReplacementInstruction[]
): void => {
  const { discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile, typeChecker } = discoveredSourceFile;

  if (!typeChecker) {
    return;
  }

  for (const change of changes) {
    classMemberReplacements({
      recorder,
      sourceFile,
      instruction: change,
      typeChecker
    });
  }
};

/**
 * Performs type-based replacements using the TypeScript type checker.
 * This function identifies nodes based on their actual TypeScript type and applies transformations.
 */
const classMemberReplacements = ({
  recorder,
  sourceFile,
  instruction,
  typeChecker
}: {
  recorder: UpdateRecorder;
  sourceFile: ts.SourceFile;
  instruction: ClassMemberReplacementInstruction;
  typeChecker: ts.TypeChecker;
}): void => {
  if (!typeChecker) {
    return;
  }

  const hasRelevantImport = sourceFile.statements.some(
    stmt =>
      ts.isImportDeclaration(stmt) &&
      ts.isStringLiteral(stmt.moduleSpecifier) &&
      instruction.module.test(stmt.moduleSpecifier.text)
  );

  if (!hasRelevantImport) {
    return;
  }

  const replacementsToMake: Replacement[] = [];

  // Visit all nodes to find property access expressions
  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
      try {
        const type = typeChecker.getTypeAtLocation(node.expression);
        const typeName = type.symbol?.name;

        if (typeName && instruction.typeNames.includes(typeName)) {
          const propertyName = node.name.text;

          // Find matching replacement
          const replacement = instruction.propertyReplacements.find(
            r => r.property === propertyName
          );

          if (replacement) {
            const expressionText = node.expression.getText(sourceFile);
            const replacementText = replacement.replacement
              .replace(/\$\{expression\}/g, expressionText)
              .replace(/\$\{property\}/g, propertyName);

            replacementsToMake.push({
              start: node.getStart(sourceFile),
              end: node.getEnd(),
              text: replacementText
            });
          }
        }
      } catch {
        // Ignore type checking errors
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  // Apply replacements in reverse order to maintain correct positions
  if (replacementsToMake.length > 0) {
    replacementsToMake.sort((a, b) => b.start - a.start);

    for (const replacement of replacementsToMake) {
      recorder.remove(replacement.start, replacement.end - replacement.start);
      recorder.insertLeft(replacement.start, replacement.text);
    }
  }
};
