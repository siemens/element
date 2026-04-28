/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { EmitHint } from 'typescript';

import { applyImport, discoverSourceFiles, getImportSpecifiers } from '../../utils/index.js';

type Transformation = { start: number; end: number; replacement: string };

interface VisitFunctionCallOptions {
  sourceFile: ts.SourceFile;
  moduleSpecifier: string | RegExp;
  className?: string;
  functionName: string;
  visitor: (node: ts.CallExpression) => void;
}

export const missingTranslateMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating missing translate provider...');

    for await (const { path: filePath, sourceFile } of discoverSourceFiles(
      tree,
      context,
      options.path
    )) {
      let content = tree.readText(filePath);
      if (!content) {
        continue;
      }

      const pendingTransformations: Transformation[] = [];
      [
        { className: 'TranslateModule', functionName: 'forRoot' },
        { functionName: 'provideTranslateService' }
      ].forEach(({ className, functionName }) =>
        visitStaticFunctionCalls({
          sourceFile,
          moduleSpecifier: /@ngx-translate\/core/,
          className,
          functionName,
          visitor: node => {
            const methodTransformation = createTranslateMethodCallTransformation(context, node);
            if (methodTransformation) {
              pendingTransformations.push(methodTransformation);
            }
          }
        })
      );

      if (pendingTransformations.length > 0) {
        // Ensure import for provideMissingTranslationHandlerForElement exists
        const importTransformation = applyImport(
          sourceFile,
          'provideMissingTranslationHandlerForElement',
          '@siemens/element-translate-ng/ngx-translate'
        );
        if (importTransformation) {
          pendingTransformations.push(importTransformation);
        }

        // Sort transformations by start position descending to preserve offsets
        // This become important when multiple transformations are applied to the same file
        pendingTransformations.sort((a, b) => b.start - a.start);

        for (const transformation of pendingTransformations) {
          content =
            content.slice(0, transformation.start) +
            transformation.replacement +
            content.slice(transformation.end);
        }
        tree.overwrite(filePath, content);
      }
    }
  };
};

/** Update the TranslateModule.forRoot() call to include `missingTranslationHandler: provideMissingTranslationHandlerForElement()` */
const createTranslateMethodCallTransformation = (
  context: SchematicContext,
  node: ts.CallExpression
): Transformation | null => {
  // Check if there are arguments
  const firstArg = node.arguments.at(0);
  if (firstArg && !ts.isObjectLiteralExpression(firstArg)) {
    return null;
  }

  // Find existing missingTranslationHandler property if it exists
  const existingHandlerProp = firstArg?.properties.find(
    prop =>
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'missingTranslationHandler'
  ) as ts.PropertyAssignment | undefined;

  // Check if provideMissingTranslationHandlerForElement is already used
  if (existingHandlerProp && ts.isCallExpression(existingHandlerProp.initializer)) {
    const expression = existingHandlerProp.initializer.expression;
    if (
      ts.isIdentifier(expression) &&
      expression.text === 'provideMissingTranslationHandlerForElement'
    ) {
      // Already migrated, skip
      return null;
    }
  }

  // Filter out the existing missingTranslationHandler property if present
  const otherProperties =
    firstArg?.properties.filter(
      prop =>
        !ts.isPropertyAssignment(prop) ||
        !ts.isIdentifier(prop.name) ||
        prop.name.text !== 'missingTranslationHandler'
    ) ?? [];

  // Create the new missingTranslationHandler property
  const missingTranslationHandlerProperty = ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier('missingTranslationHandler'),
    ts.factory.createCallExpression(
      ts.factory.createIdentifier('provideMissingTranslationHandlerForElement'),
      undefined,
      existingHandlerProp ? [existingHandlerProp.initializer] : undefined
    )
  );

  const updatedCall = ts.factory.createCallExpression(
    node.expression,
    undefined,
    ts.factory.createNodeArray(
      [
        ts.factory.createObjectLiteralExpression([
          ...otherProperties,
          missingTranslationHandlerProperty
        ])
      ],
      node.arguments.hasTrailingComma
    )
  );

  return {
    start: node.getStart(),
    end: node.getEnd(),
    replacement: ts
      .createPrinter()
      .printNode(EmitHint.Expression, updatedCall, node.getSourceFile())
  };
};

/**
 * Visits all function static call nodes that match the given module, class, and function names.
 * This function handles nested calls, so it will find `ClassName.method()`.
 * If className is not provided, it will search for standalone function calls (e.g., `functionName()`).
 */
export const visitStaticFunctionCalls = ({
  sourceFile,
  moduleSpecifier,
  className,
  functionName,
  visitor
}: VisitFunctionCallOptions): void => {
  // Get all import specifiers from the module
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const importSpecifierName = className || functionName;
  const allImportSpecifiers = getImportSpecifiers(sourceFile, moduleSpecifier, importSpecifierName);
  if (allImportSpecifiers.length === 0) {
    return;
  }

  // Get the local names (including aliases) for the imported class or function
  const localNames = allImportSpecifiers.map(spec => spec.name.text);

  // Recursive visitor function that traverses all nodes including nested function call arguments
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (className) {
        // Handle PropertyAccessExpression (e.g. Class.method())
        if (ts.isPropertyAccessExpression(expression)) {
          const propertyName = expression.name.text;

          // Check if the method name matches
          if (propertyName === functionName) {
            const objectExpression = expression.expression;
            // Case 1: Static call - ClassName.method()
            if (ts.isIdentifier(objectExpression)) {
              if (localNames.includes(objectExpression.text)) {
                visitor(node);
              }
            }
          }
        }
      } else {
        // Handle standalone function calls (e.g., functionName())
        if (ts.isIdentifier(expression)) {
          if (localNames.includes(expression.text)) {
            visitor(node);
          }
        }
      }
    }

    // Recursively visit all children
    ts.forEachChild(node, visit);
  };

  // Start visiting from the source file
  ts.forEachChild(sourceFile, visit);
};
