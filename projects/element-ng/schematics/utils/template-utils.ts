/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path/posix';
import ts, { NoSubstitutionTemplateLiteral, PropertyAssignment, StringLiteral } from 'typescript';

import { findAttribute, findElement } from './html-utils.js';

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

const renameElementTagInTemplate = ({
  template,
  offset,
  recorder,
  fromName,
  toName,
  defaultAttributes
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  fromName: string;
  toName: string;
  defaultAttributes?: { name: string; value: string }[];
}): void => {
  findElement(template, element => element.name === fromName).forEach(el => {
    recorder.remove(el.startSourceSpan.start.offset + 1 + offset, fromName.length);
    recorder.insertLeft(el.startSourceSpan.start.offset + 1 + offset, toName);
    if (el.endSourceSpan && el.startSourceSpan.start !== el.endSourceSpan.start) {
      recorder.remove(el.endSourceSpan?.start.offset + 2 + offset, fromName.length);
      recorder.insertLeft(el.endSourceSpan?.start.offset + 2 + offset, toName);
    }

    if (defaultAttributes && defaultAttributes.length > 0) {
      const existingAttrNames = new Set(el.attrs.map(attr => attr.name));
      const attrsToAdd = defaultAttributes.filter(attr => !existingAttrNames.has(attr.name));

      if (attrsToAdd.length > 0) {
        const insertPosition = el.startSourceSpan.start.offset + 1 + offset + toName.length;
        const attrsString = attrsToAdd.map(attr => ` ${attr.name}="${attr.value}"`).join('');
        recorder.insertLeft(insertPosition, attrsString);
      }
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

const renameComponentPropertyInTemplate = ({
  template,
  offset,
  recorder,
  elementName,
  properties
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  elementName: string;
  properties: { replace: string; replaceWith: string | string[] }[];
}): void => {
  findElement(template, element => element.name === elementName).forEach(el => {
    for (const property of properties) {
      el.attrs
        .filter(
          attr =>
            attr.name === property.replace ||
            attr.name === `[${property.replace}]` ||
            attr.name === `(${property.replace})`
        )
        .forEach(attr => {
          const hasBrackets = attr.name.startsWith('[') || attr.name.startsWith('(');
          const isArray = Array.isArray(property.replaceWith);

          if (isArray) {
            const valueStart = attr.valueSpan?.start.offset;
            const valueEnd = attr.valueSpan?.end.offset;

            if (!valueStart || !valueEnd) {
              return;
            }

            const value = template.substring(valueStart, valueEnd);
            const attrLength = attr.sourceSpan.toString().length;

            // Remove the original attribute
            recorder.remove(attr.sourceSpan.start.offset + offset, attrLength);

            // Insert new attributes
            const newAttrs = (property.replaceWith as string[])
              .map((newName: string) => {
                const attrName = hasBrackets ? `[${newName}]` : newName;
                return `${attrName}="${value}"`;
              })
              .join(' ');

            recorder.insertLeft(attr.sourceSpan.start.offset + offset, newAttrs);
          } else {
            const newName = property.replaceWith as string;
            if (hasBrackets) {
              const startOffset = attr.sourceSpan.start.offset + offset + 1;
              recorder.remove(startOffset, property.replace.length);
              recorder.insertLeft(startOffset, newName);
            } else {
              recorder.remove(attr.sourceSpan.start.offset + offset, property.replace.length);
              recorder.insertLeft(attr.sourceSpan.start.offset + offset, newName);
            }
          }
        });
    }
  });
};

const removeSymbols = ({
  template,
  offset,
  recorder,
  elementName,
  attributeSelector,
  names
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  elementName: string;
  attributeSelector: string | undefined;
  names: string[];
}): void => {
  findElement(template, element => element.name === elementName).forEach(el => {
    if (attributeSelector) {
      const hasAttributeSelector = el.attrs.some(attr => attr.name === attributeSelector);
      if (!hasAttributeSelector) {
        return;
      }
    }

    for (const name of names) {
      el.attrs
        .filter(
          attr => attr.name === name || attr.name === `[${name}]` || attr.name === `(${name})`
        )
        .forEach(attr => {
          const apiLength = attr.sourceSpan.toString().length;
          recorder.remove(attr.sourceSpan.start.offset + offset, apiLength);
        });
    }
  });
};

interface RenameElementTagParams {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  fromName: string;
  toName: string;
  defaultAttributes?: { name: string; value: string }[];
}

export const renameElementTag = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  fromName,
  toName,
  defaultAttributes
}: RenameElementTagParams): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    renameElementTagInTemplate({
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      offset: template.getStart() + 1,
      toName,
      fromName,
      recorder,
      defaultAttributes
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
      recorder: templateRecorder,
      defaultAttributes
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
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
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

export const renameComponentProperty = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  elementName,
  properties
}: {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  elementName: string;
  properties: { replace: string; replaceWith: string | string[] }[];
}): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    renameComponentPropertyInTemplate({
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      offset: template.getStart() + 1,
      elementName,
      recorder,
      properties
    })
  );
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = tree.read(templatePath)!.toString('utf-8');
    const templateRecorder = tree.beginUpdate(templatePath);
    renameComponentPropertyInTemplate({
      template: templateContent,
      offset: 0,
      elementName,
      recorder: templateRecorder,
      properties
    });
    tree.commitUpdate(templateRecorder);
  });
};

export const removeSymbol = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  elementName,
  attributeSelector,
  names
}: {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  elementName: string;
  attributeSelector: string | undefined;
  names: string[];
}): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    removeSymbols({
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      offset: template.getStart() + 1,
      elementName,
      attributeSelector,
      recorder,
      names
    })
  );
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = tree.read(templatePath)!.toString('utf-8');
    const templateRecorder = tree.beginUpdate(templatePath);
    removeSymbols({
      template: templateContent,
      offset: 0,
      elementName,
      attributeSelector,
      recorder: templateRecorder,
      names
    });
    tree.commitUpdate(templateRecorder);
  });
};
