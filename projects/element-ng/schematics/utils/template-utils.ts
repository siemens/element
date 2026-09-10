/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import ts from 'typescript';

export type ComponentTemplate =
  | {
      component: ts.ClassDeclaration;
      kind: 'inline';
      node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral;
    }
  | {
      component: ts.ClassDeclaration;
      kind: 'external';
      url: string;
    };

export const getComponentTemplates = (source: ts.SourceFile): ComponentTemplate[] => {
  const templates: ComponentTemplate[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node)) {
      for (const decorator of ts.getDecorators(node) ?? []) {
        const call = decorator.expression;
        if (
          !ts.isCallExpression(call) ||
          !ts.isIdentifier(call.expression) ||
          call.expression.text !== 'Component'
        ) {
          continue;
        }

        const metadata = call.arguments[0];
        if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
          continue;
        }

        for (const property of metadata.properties) {
          if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) {
            continue;
          }

          const value = property.initializer;
          if (
            property.name.text === 'template' &&
            (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))
          ) {
            templates.push({ component: node, kind: 'inline', node: value });
          } else if (property.name.text === 'templateUrl' && ts.isStringLiteral(value)) {
            templates.push({ component: node, kind: 'external', url: value.text });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return templates;
};

export const getInlineTemplates = (
  source: ts.SourceFile
): (ts.NoSubstitutionTemplateLiteral | ts.StringLiteral)[] =>
  getComponentTemplates(source).flatMap(template =>
    template.kind === 'inline' ? [template.node] : []
  );

export const getTemplateUrl = (source: ts.SourceFile): string[] =>
  getComponentTemplates(source).flatMap(template =>
    template.kind === 'external' ? [template.url] : []
  );
