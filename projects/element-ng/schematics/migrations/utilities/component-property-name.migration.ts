/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path/posix';
import ts from 'typescript';

import { findElement, getInlineTemplates, getTemplateUrl } from '../../utils/index.js';
import { ComponentPropertyNamesInstruction } from '../data/index.js';
import { MigrationContext } from './migration.interface.js';

export const applyComponentPropertyNameMigration = (
  context: MigrationContext,
  changes: ComponentPropertyNamesInstruction[]
): void => {
  const { tree, discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { path: filePath, sourceFile } = discoveredSourceFile;

  for (const change of changes) {
    renameComponentProperty({
      tree,
      recorder,
      sourceFile,
      filePath,
      elementName: change.elementSelector,
      properties: change.propertyMappings
    });
  }
};

const renameComponentProperty = ({
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
