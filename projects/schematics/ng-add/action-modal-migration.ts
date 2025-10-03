/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

import { discoverSourceFiles, getImportSpecifiers } from '../utils';
import {
  ACTION_DIALOG_TYPES_REPLACEMENTS,
  ACTION_MODAL_SYMBOLS,
  CodeTransformation,
  DIALOG_METHOD_CONFIGS,
  LEGACY_METHODS,
  LegacyMethodName
} from './mappings';

/**
 * Migration rule for action modal methods.
 * @param options - The options object containing the path to the project files to be migrated.
 * @returns A schematic rule for migrating action modal methods.
 */
export const actionModalMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating action modal methods to v48...');

    const tsSourceFiles = discoverSourceFiles(tree, context, options.path);

    for (const filePath of tsSourceFiles) {
      const content = tree.read(filePath);
      if (!content) {
        continue;
      }

      const sourceFile = ts.createSourceFile(
        filePath,
        content.toString(),
        ts.ScriptTarget.Latest,
        true
      );

      // Match both @siemens/element-ng and @simpl/element-ng, with or without /action-modal
      // This ensures we only process files that import from these modules
      const modulePathToMatch = /@(siemens|simpl)\/element-ng(\/action-modal)?/;

      const actionModalImports = getImportSpecifiers(
        sourceFile,
        modulePathToMatch,
        ACTION_MODAL_SYMBOLS
      );

      if (!actionModalImports || actionModalImports.length === 0) {
        continue;
      }

      const pendingTransformations: CodeTransformation[] = [];

      const visitNodeAndCollectTransformations = (node: ts.Node): void => {
        // Collect method call transformations
        if (ts.isCallExpression(node)) {
          const methodTransformation = createActionDialogMethodCallTransformation(node);
          if (methodTransformation) {
            pendingTransformations.push(methodTransformation);
          }
        }

        // Collect type reference transformations
        if (ts.isPropertyAccessExpression(node)) {
          const typeTransformation = createActionDialogTypeTransformation(node);
          if (typeTransformation) {
            pendingTransformations.push(typeTransformation);
          }
        }

        node.forEachChild(visitNodeAndCollectTransformations);
      };
      sourceFile.forEachChild(visitNodeAndCollectTransformations);

      if (pendingTransformations.length > 0) {
        applyCodeTransformations(tree, filePath, pendingTransformations);
      }
    }

    return tree;
  };
};

const createActionDialogMethodCallTransformation = (node: ts.CallExpression): CodeTransformation | null => {
  const fullMethodCall = node.expression.getText();

  const methodMatch = LEGACY_METHODS.find(m => fullMethodCall.endsWith(`.${m}`));

  if (!methodMatch) {
    return null;
  }

  const methodCallSegments = fullMethodCall.split('.');
  const methodName = methodCallSegments.pop() as LegacyMethodName;
  const servicePath = methodCallSegments.join('.');

  const dialogProperties = generateDialogProperties(methodName, node.arguments);
  const newCode = `${servicePath}.showActionDialog({ ${dialogProperties.join(', ')} })`;

  return {
    node,
    newCode,
    type: 'method-call'
  };
};

const createActionDialogTypeTransformation = (
  node: ts.PropertyAccessExpression
): CodeTransformation | null => {
  const nodeText = node.getText().trim();

  const matchingReplacement = ACTION_DIALOG_TYPES_REPLACEMENTS.find(
    typeReplacement => nodeText === typeReplacement.old
  );

  if (!matchingReplacement) {
    return null;
  }

  return {
    node,
    newCode: `'${matchingReplacement.new}'`,
    type: 'type-reference'
  };
};

/**
 * Generates the dialog properties for the action dialog.
 * @param methodName - The name of the method being migrated.
 * @param nodeArguments - The arguments passed to the method.
 * @returns An array of dialog property strings.
 * Example: ["type: 'confirmation'", "message: 'Are you sure?'", "heading: 'Confirm Action'"]
 * @throws SchematicsException if the method configuration is unknown.
 */
const generateDialogProperties = (
  methodName: LegacyMethodName,
  nodeArguments: ts.NodeArray<ts.Expression>
): string[] => {
  const methodConfig = DIALOG_METHOD_CONFIGS[methodName];

  if (!methodConfig) {
    throw new SchematicsException(`Unknown method configuration for: ${methodName}`);
  }

  const dialogProperties = [`type: '${methodConfig.type}'`];

  const indexToParamMap: Record<number, string> = {};
  Object.entries(methodConfig.parameters).forEach(
    ([paramName, paramIndex]) => (indexToParamMap[paramIndex] = paramName)
  );

  nodeArguments.forEach((arg, index) => {
    const paramName = indexToParamMap[index];
    if (paramName) {
      dialogProperties.push(`${paramName}: ${arg.getText()}`);
    }
  });
  return dialogProperties;
};

const applyCodeTransformations = (
  tree: Tree,
  filePath: string,
  codeTransformations: CodeTransformation[]
): void => {
  const recorder = tree.beginUpdate(filePath);
  // Sort by position (descending) to avoid offset issues
  codeTransformations
    .sort((a, b) => b.node.getStart() - a.node.getStart())
    .forEach(({ node, newCode }) => {
      recorder.remove(node.getStart(), node.getWidth());
      recorder.insertLeft(node.getStart(), newCode);
    });
  tree.commitUpdate(recorder);
};
