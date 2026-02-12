/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import ts, { NoSubstitutionTemplateLiteral, PropertyAssignment, StringLiteral } from 'typescript';

export const getInlineTemplates = (
  source: ts.SourceFile
): (NoSubstitutionTemplateLiteral | StringLiteral)[] => {
  const templateNodes: (NoSubstitutionTemplateLiteral | StringLiteral)[] = [];
  const componentDecoratorVisitor = (node: ts.Node): void => {
    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'Component'
    ) {
      const arg = node.expression.arguments[0];
      if (ts.isObjectLiteralExpression(arg)) {
        const template = arg.properties.find(
          property =>
            ts.isPropertyAssignment(property) &&
            ts.isIdentifier(property.name) &&
            property.name.text === 'template'
        ) as PropertyAssignment;
        const initializer = template?.initializer;
        if (
          initializer &&
          (ts.isNoSubstitutionTemplateLiteral(initializer) || ts.isStringLiteral(initializer))
        ) {
          templateNodes.push(initializer);
        }
      }
    } else {
      node.forEachChild(componentDecoratorVisitor);
    }
  };

  source.forEachChild(componentDecoratorVisitor);

  return templateNodes;
};

export const getTemplateUrl = (source: ts.SourceFile): string[] => {
  const templateUrls: string[] = [];
  const componentDecoratorVisitor = (node: ts.Node): void => {
    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'Component'
    ) {
      const arg = node.expression.arguments[0];
      if (ts.isObjectLiteralExpression(arg)) {
        const template = arg.properties.find(
          property =>
            ts.isPropertyAssignment(property) &&
            ts.isIdentifier(property.name) &&
            property.name.text === 'templateUrl'
        ) as PropertyAssignment;
        const initializer = template?.initializer;
        if (initializer && ts.isStringLiteral(initializer)) {
          templateUrls.push(initializer.text);
        }
      }
    } else {
      node.forEachChild(componentDecoratorVisitor);
    }
  };

  source.forEachChild(componentDecoratorVisitor);

  return templateUrls;
};
