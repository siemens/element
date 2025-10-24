/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path';
import ts, { NoSubstitutionTemplateLiteral, PropertyAssignment, StringLiteral } from 'typescript';

import { findAttribute, findElement } from './html-utils.js';

const getInlineTemplates = (
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

const getTemplateUrl = (source: ts.SourceFile): string[] => {
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

const renameElementTagInTemplate = ({
  template,
  offset,
  recorder,
  fromName,
  toName
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  fromName: string;
  toName: string;
}): void => {
  findElement(template, element => element.name === fromName).forEach(el => {
    recorder.remove(el.startSourceSpan.start.offset + 1 + offset, fromName.length);
    recorder.insertLeft(el.startSourceSpan.start.offset + 1 + offset, toName);
    if (el.endSourceSpan && el.startSourceSpan.start !== el.endSourceSpan.start) {
      recorder.remove(el.endSourceSpan?.start.offset + 2 + offset, fromName.length);
      recorder.insertLeft(el.endSourceSpan?.start.offset + 2 + offset, toName);
    }
  });
};

const renameAttributeInTemplate = ({
  template,
  offset,
  recorder,
  fromName,
  toName
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  fromName: string;
  toName: string;
}): void => {
  findAttribute(template, element => element.name === fromName).forEach(el => {
    recorder.remove(el.sourceSpan.start.offset + offset, fromName.length);
    recorder.insertLeft(el.sourceSpan.start.offset + offset, toName);
  });
};

interface RenameElementTagParams {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  fromName: string;
  toName: string;
}

export const renameElementTag = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  fromName,
  toName
}: RenameElementTagParams): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    renameElementTagInTemplate({
      template: template.text,
      offset: template.getStart() + 1,
      toName,
      fromName,
      recorder
    })
  );
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = tree.read(templatePath)!.toString('utf-8');
    const templateRecorder = tree.beginUpdate(templatePath);
    renameElementTagInTemplate({
      template: templateContent,
      offset: 0,
      toName,
      fromName,
      recorder: templateRecorder
    });
    tree.commitUpdate(templateRecorder);
  });
};

export const renameAttribute = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  fromName,
  toName
}: RenameElementTagParams): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    renameAttributeInTemplate({
      template: template.text,
      offset: template.getStart() + 1,
      toName,
      fromName,
      recorder
    })
  );
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = tree.read(templatePath)!.toString('utf-8');
    const templateRecorder = tree.beginUpdate(templatePath);
    renameAttributeInTemplate({
      template: templateContent,
      offset: 0,
      toName,
      fromName,
      recorder: templateRecorder
    });
    tree.commitUpdate(templateRecorder);
  });
};
