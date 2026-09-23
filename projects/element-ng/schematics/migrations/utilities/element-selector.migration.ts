/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path/posix';

import {
  findElement,
  getInlineTemplates,
  getTemplateUrl,
  removeAttributesFromElement
} from '../../utils/index.js';
import { ElementSelectorInstruction } from '../data/index.js';
import { MigrationContext, RenameElementTagParams } from './migration.interface.js';

export const applyElementSelectorMigration = (
  context: MigrationContext,
  changes: ElementSelectorInstruction[]
): void => {
  const { tree, discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile, path: filePath } = discoveredSourceFile;

  for (const change of changes) {
    renameElementTag({
      tree,
      recorder,
      sourceFile,
      filePath,
      fromName: change.replace,
      toName: change.replaceWith,
      defaultAttributes: change.defaultAttributes,
      removeAttributes: change.removeAttributes
    });
  }
};

const renameElementTag = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  fromName,
  toName,
  defaultAttributes,
  removeAttributes
}: RenameElementTagParams): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    renameElementTagInTemplate({
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      offset: template.getStart() + 1,
      toName,
      fromName,
      recorder,
      defaultAttributes,
      removeAttributes
    })
  );
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    if (!tree.exists(templatePath)) {
      return;
    }

    const templateContent = tree.read(templatePath)!.toString('utf-8');
    const templateRecorder = tree.beginUpdate(templatePath);
    renameElementTagInTemplate({
      template: templateContent,
      offset: 0,
      toName,
      fromName,
      recorder: templateRecorder,
      defaultAttributes,
      removeAttributes
    });
    tree.commitUpdate(templateRecorder);
  });
};

const renameElementTagInTemplate = ({
  template,
  offset,
  recorder,
  fromName,
  toName,
  defaultAttributes,
  removeAttributes
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  fromName: string;
  toName: string;
  defaultAttributes?: { name: string; value: string }[];
  removeAttributes?: string[];
}): void => {
  for (const element of findElement(template, node => node.name === fromName)) {
    const openingNameStart = element.startSourceSpan.start.offset + 1 + offset;
    recorder.remove(openingNameStart, fromName.length);
    recorder.insertLeft(openingNameStart, toName);

    const closingTag = element.endSourceSpan;
    if (closingTag && closingTag.start.offset !== element.startSourceSpan.start.offset) {
      const closingNameStart = closingTag.start.offset + 2 + offset;
      recorder.remove(closingNameStart, fromName.length);
      recorder.insertLeft(closingNameStart, toName);
    }

    if (defaultAttributes && defaultAttributes.length > 0) {
      const existingAttrNames = new Set(element.attrs.map(attr => attr.name));
      const attrsToAdd = defaultAttributes.filter(attr => !existingAttrNames.has(attr.name));

      if (attrsToAdd.length > 0) {
        const insertPosition = element.startSourceSpan.start.offset + 1 + offset + toName.length;
        const attrsString = attrsToAdd.map(attr => ` ${attr.name}="${attr.value}"`).join('');
        recorder.insertLeft(insertPosition, attrsString);
      }
    }

    removeAttributesFromElement(template, element, removeAttributes ?? [], offset, recorder);
  }
};
