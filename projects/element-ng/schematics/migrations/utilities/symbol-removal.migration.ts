/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { join, dirname } from 'path/posix';
import ts from 'typescript';

import { findElement, getInlineTemplates, getTemplateUrl } from '../../utils/index.js';
import { SymbolRemovalInstruction } from '../data/index.js';
import { MigrationContext } from './migration.interface.js';

export const applySymbolRemovalMigration = (
  context: MigrationContext,
  changes: SymbolRemovalInstruction[]
): void => {
  const { tree, discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile, path: filePath } = discoveredSourceFile;

  for (const change of changes) {
    removeSymbol({
      tree,
      recorder,
      sourceFile,
      filePath,
      elementName: change.elementSelector,
      attributeSelector: change.attributeSelector,
      names: change.names
    });
  }
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
