/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { removeImportSpecifiers } from '../migrations/utilities/import-removal.js';
import {
  applyImport,
  discoverSourceFiles,
  findElement,
  getImportSpecifiers,
  getInlineTemplates,
  getTemplateUrl
} from '../utils/index.js';

const LEGACY_COMPONENT = 'SiMarkdownRendererComponent';
const MARKDOWN_COMPONENT = 'SiMarkdownComponent';
const LEGACY_IMPORT = '@siemens/element-ng/markdown-renderer';
const MARKDOWN_IMPORT = '@siemens/element-ng/markdown';

export const markdownRendererMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const legacyImports = getImportSpecifiers(sourceFile, LEGACY_IMPORT, LEGACY_COMPONENT);
      if (!legacyImports.length) {
        continue;
      }

      const recorder = tree.beginUpdate(filePath);
      migrateInlineTemplates(sourceFile, recorder);
      migrateExternalTemplates(tree, sourceFile, filePath, processedTemplates);
      migrateComponentReferences(sourceFile, legacyImports, recorder);
      removeLegacyImports(sourceFile, legacyImports, recorder);

      const importChange = applyImport(sourceFile, MARKDOWN_COMPONENT, MARKDOWN_IMPORT);
      if (importChange) {
        recorder.insertLeft(importChange.start, importChange.replacement);
      }

      tree.commitUpdate(recorder);
    }

    return tree;
  };
};

const migrateInlineTemplates = (sourceFile: ts.SourceFile, recorder: UpdateRecorder): void => {
  for (const template of getInlineTemplates(sourceFile)) {
    migrateTemplate(
      sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      template.getStart() + 1,
      recorder
    );
  }
};

const migrateExternalTemplates = (
  tree: Tree,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedTemplates: Set<string>
): void => {
  for (const templateUrl of getTemplateUrl(sourceFile)) {
    const templatePath = join(dirname(filePath), templateUrl);
    if (processedTemplates.has(templatePath)) {
      continue;
    }

    const templateBuffer = tree.read(templatePath);
    if (!templateBuffer) {
      continue;
    }

    processedTemplates.add(templatePath);
    const recorder = tree.beginUpdate(templatePath);
    migrateTemplate(templateBuffer.toString('utf-8'), 0, recorder);
    tree.commitUpdate(recorder);
  }
};

const migrateTemplate = (template: string, offset: number, recorder: UpdateRecorder): void => {
  findElement(template, element => element.name === 'si-markdown-renderer').forEach(element => {
    recorder.remove(
      element.startSourceSpan.start.offset + offset + 1,
      'si-markdown-renderer'.length
    );
    recorder.insertLeft(element.startSourceSpan.start.offset + offset + 1, 'si-markdown');

    if (element.endSourceSpan && element.startSourceSpan.start !== element.endSourceSpan.start) {
      recorder.remove(
        element.endSourceSpan.start.offset + offset + 2,
        'si-markdown-renderer'.length
      );
      recorder.insertLeft(element.endSourceSpan.start.offset + offset + 2, 'si-markdown');
    }

    element.attrs
      .filter(attribute => attribute.name === 'text' || attribute.name === '[text]')
      .forEach(attribute => {
        const replacement = attribute.name === 'text' ? 'markdown' : '[markdown]';
        recorder.remove(attribute.sourceSpan.start.offset + offset, attribute.name.length);
        recorder.insertLeft(attribute.sourceSpan.start.offset + offset, replacement);
      });
  });
};

const migrateComponentReferences = (
  sourceFile: ts.SourceFile,
  legacyImports: ts.ImportSpecifier[],
  recorder: UpdateRecorder
): void => {
  const legacyNames = new Set(legacyImports.map(importSpecifier => importSpecifier.name.text));

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && legacyNames.has(node.text)) {
      recorder.remove(node.getStart(sourceFile), node.getWidth(sourceFile));
      recorder.insertLeft(node.getStart(sourceFile), MARKDOWN_COMPONENT);
      return;
    }

    ts.forEachChild(node, visit);
  };

  sourceFile.statements
    .filter(statement => !ts.isImportDeclaration(statement))
    .forEach(statement => visit(statement));
};

const removeLegacyImports = (
  sourceFile: ts.SourceFile,
  legacyImports: ts.ImportSpecifier[],
  recorder: UpdateRecorder
): void => {
  const importsByDeclaration = new Map<ts.ImportDeclaration, ts.ImportSpecifier[]>();

  legacyImports.forEach(importSpecifier => {
    const importDeclaration = importSpecifier.parent.parent.parent;
    if (!ts.isImportDeclaration(importDeclaration)) {
      return;
    }

    const specifiers = importsByDeclaration.get(importDeclaration) ?? [];
    specifiers.push(importSpecifier);
    importsByDeclaration.set(importDeclaration, specifiers);
  });

  importsByDeclaration.forEach((specifiers, importDeclaration) => {
    const edit = removeImportSpecifiers(sourceFile, importDeclaration, specifiers);
    recorder.remove(edit.start, edit.width);
    if (edit.newNode) {
      recorder.insertLeft(
        edit.start,
        ts.createPrinter().printNode(ts.EmitHint.Unspecified, edit.newNode, sourceFile)
      );
    }
  });
};
