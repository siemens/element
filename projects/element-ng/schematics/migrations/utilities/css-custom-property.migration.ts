/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import ts from 'typescript';

import { CssCustomPropertyInstruction } from '../data/index.js';
import { MigrationContext } from './migration.interface.js';

export const applyCssCustomPropertyMigration = (
  context: MigrationContext,
  changes: CssCustomPropertyInstruction[]
): void => {
  if (!changes?.length) {
    return;
  }

  const { recorder } = context;
  const { sourceFile } = context.discoveredSourceFile;

  const visit = (node: ts.Node): void => {
    if (
      !ts.isStringLiteralLike(node) &&
      node.kind !== ts.SyntaxKind.TemplateHead &&
      node.kind !== ts.SyntaxKind.TemplateMiddle &&
      node.kind !== ts.SyntaxKind.TemplateTail
    ) {
      node.forEachChild(visit);
      return;
    }

    const start = node.getStart(sourceFile);
    const end = node.getEnd();
    const original = sourceFile.text.slice(start, end);
    const updated = replaceCustomProperties(original, changes);
    if (updated !== original) {
      recorder.remove(start, end - start);
      recorder.insertLeft(start, updated);
    }
  };

  sourceFile.forEachChild(visit);
};

export const migrateCssCustomPropertiesInExternalFiles = (
  tree: Tree,
  projectPath: string,
  changes: CssCustomPropertyInstruction[]
): void => {
  if (!changes?.length) {
    return;
  }

  const trimmedPath = projectPath.replace(/^\/+|\/+$/g, '');
  const normalizedProjectPath = trimmedPath ? `/${trimmedPath}/` : '/';

  tree.visit(filePath => {
    if (
      !filePath.startsWith(normalizedProjectPath) ||
      !['.css', '.html', '.less', '.sass', '.scss'].some(extension => filePath.endsWith(extension))
    ) {
      return;
    }

    const content = tree.readText(filePath);
    const updatedContent = replaceCustomProperties(content, changes);
    if (updatedContent !== content) {
      tree.overwrite(filePath, updatedContent);
    }
  });
};

const replaceCustomProperties = (
  content: string,
  changes: CssCustomPropertyInstruction[]
): string => {
  return changes.reduce((updated, change) => {
    const escapedName = change.replace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return updated.replace(new RegExp(`${escapedName}(?![\\w-])`, 'g'), change.replaceWith);
  }, content);
};
