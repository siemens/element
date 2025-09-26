/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

import { discoverSourceFiles } from '../../utils/project-utils';
import { getImportSpecifiers } from '../../utils/ts-utils';
import {
  ACTION_DIALOG_SYMBOLS,
  DIALOG_METHOD_CONFIGS,
  LEGACY_METHODS,
  LegacyMethodName
} from './model';

export const actionDialogMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating action dialog methods to v48...');

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

      const actionModalImports = getImportSpecifiers(
        sourceFile,
        '@simpl/element-ng/action-modal',
        ACTION_DIALOG_SYMBOLS
      );

      if (!actionModalImports || actionModalImports.length === 0) {
        continue;
      }

      const methodCallTransformations: { node: ts.CallExpression; newCode: string }[] = [];

      const collectTransformations = (node: ts.Node): void => {
        if (ts.isCallExpression(node) && isLegacyActionDialogCall(node)) {
          const fullMethodCall = node.expression.getText();
          const methodCallSegments = fullMethodCall.split('.');
          const methodName = methodCallSegments.pop() as LegacyMethodName;
          const servicePath = methodCallSegments.join('.');

          if (!LEGACY_METHODS.includes(methodName)) {
            return;
          }

          const dialogProperties: string[] = generateDialogProperties(methodName, node.arguments);

          methodCallTransformations.push({
            node,
            newCode: `${servicePath}.showActionDialog({ ${dialogProperties.join(', ')} })`
          });
          context.logger.debug(
            `${methodName} → showActionDialog (${dialogProperties.length} props)`
          );
        } else {
          node.forEachChild(collectTransformations);
        }
      };
      sourceFile.forEachChild(collectTransformations);

      if (methodCallTransformations.length > 0) {
        applyMethodCallTransformations(tree, filePath, methodCallTransformations);
        context.logger.info(`Transformed ${methodCallTransformations.length} calls in ${filePath}`);
      }
    }

    return tree;
  };
};

const generateDialogProperties = (
  methodName: LegacyMethodName,
  nodeArguments: ts.NodeArray<ts.Expression>
): string[] => {
  const methodConfig = DIALOG_METHOD_CONFIGS[methodName];
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

const applyMethodCallTransformations = (
  tree: Tree,
  filePath: string,
  methodCallTransformations: { node: ts.CallExpression; newCode: string }[]
): void => {
  const recorder = tree.beginUpdate(filePath);
  // Sort by position (descending) to avoid offset issues
  methodCallTransformations
    .sort((a, b) => b.node.getStart() - a.node.getStart())
    .forEach(({ node, newCode }) => {
      recorder.remove(node.getStart(), node.getWidth());
      recorder.insertLeft(node.getStart(), newCode);
    });
  tree.commitUpdate(recorder);
};

const isLegacyActionDialogCall = (node: ts.CallExpression): boolean =>
  LEGACY_METHODS.some(methodName => node.expression.getText().endsWith(`.${methodName}`));
