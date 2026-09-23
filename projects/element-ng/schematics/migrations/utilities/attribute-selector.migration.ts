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
      toName: change.replaceWith,
      removeAttributes: change.removeAttributes
    });
  }
};

const renameAttribute = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  fromName,
  toName,
  removeAttributes
}: RenameElementTagParams): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    renameAttributeInTemplate({
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      offset: template.getStart() + 1,
      toName,
      fromName,
      recorder,
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
    renameAttributeInTemplate({
      template: templateContent,
      offset: 0,
      toName,
      fromName,
      recorder: templateRecorder,
      removeAttributes
    });
    tree.commitUpdate(templateRecorder);
  });
};

const renameAttributeInTemplate = ({
  template,
  offset,
  recorder,
  fromName,
  toName,
  removeAttributes
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  fromName: string;
  toName: string;
  removeAttributes?: string[];
}): void => {
  const elements = findElement(template, element =>
    element.attrs.some(attribute => matchesSelectorAttribute(attribute.name, fromName))
  );
  for (const element of elements) {
    for (const attribute of element.attrs) {
      if (!matchesSelectorAttribute(attribute.name, fromName)) {
        continue;
      }

      const replacement = attribute.name === fromName ? toName : `[${toName}]`;
      const start = attribute.sourceSpan.start.offset + offset;
      recorder.remove(start, attribute.name.length);
      recorder.insertLeft(start, replacement);
    }

    removeAttributesFromElement(template, element, removeAttributes ?? [], offset, recorder);
  }
};

const matchesSelectorAttribute = (attributeName: string, selector: string): boolean =>
  attributeName === selector || attributeName === `[${selector}]`;
