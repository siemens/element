/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { Element } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import {
  discoverSourceFiles,
  findElement,
  getInlineTemplates,
  getTemplateUrl
} from '../utils/index.js';

export const splitSizesMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const recorder = tree.beginUpdate(filePath);

      for (const template of getInlineTemplates(sourceFile)) {
        migrateSplitSizes(
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
        const templateContent = tree.read(templatePath)!.toString('utf-8');
        const templateRecorder = tree.beginUpdate(templatePath);
        migrateSplitSizes(templateContent, 0, templateRecorder);
        tree.commitUpdate(templateRecorder);
      }
    }

    return tree;
  };
};

const migrateSplitSizes = (template: string, offset: number, recorder: UpdateRecorder): void => {
  findElement(template, element => element.name === 'si-split').forEach(split => {
    const sizes = split.attrs.find(attribute => attribute.name === '[sizes]');
    if (!sizes) {
      return;
    }

    const parts = split.children.filter(
      (child): child is Element => child instanceof Element && child.name === 'si-split-part'
    );
    const literalSizes = getNumericArrayLiteral(sizes.value);

    parts.forEach((part, index) => {
      if (part.attrs.some(attribute => attribute.name === 'size' || attribute.name === '[size]')) {
        return;
      }

      const sizeAttribute = literalSizes
        ? ` size="${literalSizes[index]}fr"`
        : ` [size]="${getIndexedSizeExpression(sizes.value, index)} + 'fr'"`;
      const startTag = part.startSourceSpan.toString();
      const insertOffset = part.startSourceSpan.end.offset - (startTag.endsWith('/>') ? 2 : 1);
      recorder.insertLeft(insertOffset + offset, sizeAttribute);
    });

    const precedingCharacter = template[sizes.sourceSpan.start.offset - 1];
    const removeOffset = sizes.sourceSpan.start.offset - (precedingCharacter === ' ' ? 1 : 0);
    const removeLength = sizes.sourceSpan.end.offset - removeOffset;
    recorder.remove(removeOffset + offset, removeLength);
  });
};

const getNumericArrayLiteral = (value: string): string[] | undefined => {
  const sourceFile = ts.createSourceFile(
    'sizes.ts',
    `const sizes = ${value};`,
    ts.ScriptTarget.Latest,
    true
  );
  const declaration = sourceFile.statements[0];

  if (!declaration || !ts.isVariableStatement(declaration)) {
    return undefined;
  }

  const initializer = declaration.declarationList.declarations[0]?.initializer;
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    return undefined;
  }

  const sizes = initializer.elements.map(element => {
    if (ts.isNumericLiteral(element)) {
      return element.text;
    }

    if (
      ts.isPrefixUnaryExpression(element) &&
      element.operator === ts.SyntaxKind.MinusToken &&
      ts.isNumericLiteral(element.operand)
    ) {
      return `-${element.operand.text}`;
    }

    return undefined;
  });

  return sizes.every((size): size is string => size !== undefined) ? sizes : undefined;
};

const getIndexedSizeExpression = (expression: string, index: number): string => {
  const isPropertyAccess = /^[A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*)*$/.test(expression);
  return `${isPropertyAccess ? expression : `(${expression})`}[${index}]`;
};
