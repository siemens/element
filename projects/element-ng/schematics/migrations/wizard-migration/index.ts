/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path';
import * as ts from 'typescript';

import {
  discoverSourceFiles,
  findElement,
  getInlineTemplates,
  getTemplateUrl
} from '../../utils/index.js';

export const wizardMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating wizard api...');

    const tsSourceFiles = await discoverSourceFiles(tree, context, options.path);

    for (const filePath of tsSourceFiles) {
      const content = tree.read(filePath);
      if (!content) {
        continue;
      }

      const sourceFile = ts.createSourceFile(
        filePath,
        content.toString(),
        ts.ScriptTarget.Latest,
        true
      );

      const recorder: UpdateRecorder = tree.beginUpdate(filePath);

      renameApi({
        tree,
        filePath,
        sourceFile,
        recorder,
        elementName: 'si-wizard'
      });

      if (recorder) {
        tree.commitUpdate(recorder);
      }
    }
  };
};

const renameApi = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  elementName
}: {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  elementName: string;
}): void => {
  getInlineTemplates(sourceFile).forEach(template =>
    addOrRemoveInlineNavigationAttribute({
      template: template.text,
      offset: template.getStart() + 1,
      elementName,
      recorder
    })
  );
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = tree.read(templatePath)!.toString('utf-8');
    const templateRecorder = tree.beginUpdate(templatePath);
    addOrRemoveInlineNavigationAttribute({
      template: templateContent,
      offset: 0,
      elementName,
      recorder: templateRecorder
    });
    tree.commitUpdate(templateRecorder);
  });
};

/**
 * Migrates the inlineNavigation attribute on wizard elements.
 * - Adds `inlineNavigation` when not present (new default: true)
 * - Removes `[inlineNavigation]="false"` (false is now the default)
 * - Keeps `[inlineNavigation]="true"` and dynamic bindings unchanged
 */

const addOrRemoveInlineNavigationAttribute = ({
  template,
  offset,
  recorder,
  elementName
}: {
  recorder: UpdateRecorder;
  template: string;
  offset: number;
  elementName: string;
}): void => {
  const elements = findElement(template, element => element.name === elementName);

  for (const element of elements) {
    const inlineNavigationAttr = element.attrs.find(
      attr => attr.name === '[inlineNavigation]' || attr.name === 'inlineNavigation'
    );

    if (!inlineNavigationAttr) {
      // No attribute exists → Add default inlineNavigation
      const insertPosition = element.startSourceSpan.end.offset + offset - 1;
      recorder.insertLeft(insertPosition, ' inlineNavigation');
    } else if (
      (inlineNavigationAttr.name === '[inlineNavigation]' ||
        inlineNavigationAttr.name === 'inlineNavigation') &&
      inlineNavigationAttr.value === 'false'
    ) {
      const { start, end } = inlineNavigationAttr.sourceSpan;
      const length = end.offset - start.offset;
      recorder.remove(start.offset + offset, length);

      // Also remove extra whitespace if present
      const nextChar = template.charAt(end.offset);
      if (nextChar === ' ') {
        recorder.remove(end.offset + offset, 1);
      }
    }
  }
};
