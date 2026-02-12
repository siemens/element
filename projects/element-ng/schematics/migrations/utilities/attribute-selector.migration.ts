/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path/posix';

import { findAttribute, getInlineTemplates, getTemplateUrl } from '../../utils/index.js';
import { AttributeSelectorInstruction } from '../data/index.js';
import { MigrationContext, RenameElementTagParams } from './migration.interface.js';

export const applyAttributeSelectorMigration = (
  context: MigrationContext,
  changes: AttributeSelectorInstruction[]
): void => {
  const { tree, discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile, path: filePath } = discoveredSourceFile;

  for (const change of changes) {
    renameAttribute({
      tree,
      recorder,
      sourceFile,
      filePath,
      fromName: change.replace,
      toName: change.replaceWith
    });
  }
};

const renameAttribute = ({
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
