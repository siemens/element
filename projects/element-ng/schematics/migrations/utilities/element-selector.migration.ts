/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path/posix';

import { findElement, getInlineTemplates, getTemplateUrl } from '../../utils/index.js';
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
      defaultAttributes: change.defaultAttributes
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
