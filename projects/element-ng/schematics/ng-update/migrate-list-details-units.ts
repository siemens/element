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
  getTemplateUrl
} from '../utils/index.js';

const disableResizingAttributeNames = [
  'disableResizing',
  '[disableResizing]',
  'bind-disableResizing'
];
const listUnitAttributeNames = ['listUnit', '[listUnit]', 'bind-listUnit'];

export const listDetailsUnitsMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const recorder = tree.beginUpdate(filePath);

      for (const template of getInlineTemplates(sourceFile)) {
        migrateListDetailsUnitsTemplate(
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
        migrateListDetailsUnitsTemplate(
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

const migrateListDetailsUnitsTemplate = (
  template: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  findElement(template, element => element.name === 'si-list-details').forEach(element => {
    migrateListDetailsElement(template, element, offset, recorder);
  });
};

const migrateListDetailsElement = (
  template: string,
  element: Element,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const disableResizingAttribute = element.attrs.find(attr =>
    disableResizingAttributeNames.includes(attr.name)
  );
  const isExplicitlyDisabled =
    disableResizingAttribute && getStaticBooleanValue(disableResizingAttribute) === true;
  if (isExplicitlyDisabled) {
    return;
  }

  const hasListUnit = element.attrs.some(attr => listUnitAttributeNames.includes(attr.name));
  if (hasListUnit) {
    return;
  }

  insertAttribute(template, element, 'listUnit="fr"', offset, recorder);
};

const insertAttribute = (
  template: string,
  element: Element,
  attribute: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const selfClosing = element.startSourceSpan.toString().endsWith('/>');
  const insertOffset = element.startSourceSpan.end.offset - (selfClosing ? 2 : 1);
  const prefix = /\s/.test(template[insertOffset - 1] ?? '') ? '' : ' ';
  recorder.insertLeft(insertOffset + offset, `${prefix}${attribute}${selfClosing ? ' ' : ''}`);
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
