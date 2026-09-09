/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import type { Attribute, Element } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import {
  discoverSourceFiles,
  findElement,
  getInlineTemplates,
  getTemplateUrl,
  insertAttribute
} from '../utils/index.js';

const resizableAttributeNames = ['resizableParts', '[resizableParts]', 'bind-resizableParts'];
const mainUnitAttributeNames = [
  'mainContainerWidthUnit',
  '[mainContainerWidthUnit]',
  'bind-mainContainerWidthUnit'
];

export const mainDetailUnitsMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const recorder = tree.beginUpdate(filePath);

      for (const template of getInlineTemplates(sourceFile)) {
        migrateMainDetailUnitsTemplate(
          sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
          template.getStart() + 1,
          recorder
        );
      }
      tree.commitUpdate(recorder);

      for (const templateUrl of getTemplateUrl(sourceFile)) {
        const templatePath = join(dirname(filePath), templateUrl);
        if (processedTemplates.has(templatePath) || !tree.exists(templatePath)) {
          continue;
        }

        processedTemplates.add(templatePath);
        const templateRecorder = tree.beginUpdate(templatePath);
        migrateMainDetailUnitsTemplate(
          tree.read(templatePath)!.toString('utf-8'),
          0,
          templateRecorder
        );
        tree.commitUpdate(templateRecorder);
      }
    }

    return tree;
  };
};

const migrateMainDetailUnitsTemplate = (
  template: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  findElement(template, element => element.name === 'si-main-detail-container').forEach(element => {
    migrateMainDetailContainerElement(template, element, offset, recorder);
  });
};

const migrateMainDetailContainerElement = (
  template: string,
  element: Element,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const resizableAttribute = element.attrs.find(attr =>
    resizableAttributeNames.includes(attr.name)
  );
  if (!resizableAttribute) {
    return;
  }

  const isExplicitlyDisabled = getStaticBooleanValue(resizableAttribute) === false;
  if (isExplicitlyDisabled) {
    return;
  }

  const hasMainUnit = element.attrs.some(attr => mainUnitAttributeNames.includes(attr.name));
  if (hasMainUnit) {
    return;
  }

  insertAttribute(template, element, 'mainContainerWidthUnit="fr"', offset, recorder);
};

const getStaticBooleanValue = (attribute: Attribute): boolean | undefined => {
  if (!attribute.name.startsWith('[')) {
    if (/^\s*{{[\s\S]*}}\s*$/.test(attribute.value)) {
      return undefined;
    }
    return attribute.value !== 'false';
  }

  const initializer = getExpression(attribute.value);
  if (!initializer) {
    return undefined;
  }

  if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (
    initializer.kind === ts.SyntaxKind.FalseKeyword ||
    initializer.kind === ts.SyntaxKind.NullKeyword ||
    (ts.isIdentifier(initializer) && initializer.text === 'undefined') ||
    (ts.isStringLiteral(initializer) && initializer.text === 'false')
  ) {
    return false;
  }
  if (ts.isStringLiteral(initializer) || ts.isNumericLiteral(initializer)) {
    return true;
  }

  return undefined;
};

const getExpression = (value: string): ts.Expression | undefined => {
  const statement = ts.createSourceFile(
    'template-expression.ts',
    `const value = ${value};`,
    ts.ScriptTarget.Latest,
    true
  ).statements[0];
  if (!statement || !ts.isVariableStatement(statement)) {
    return undefined;
  }

  return statement.declarationList.declarations[0]?.initializer;
};
