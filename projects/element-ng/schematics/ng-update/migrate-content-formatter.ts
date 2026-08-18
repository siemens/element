/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { Element } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { applyImport, discoverSourceFiles, findElement } from '../utils/index.js';

const MESSAGE_SELECTORS = new Set(['si-ai-message', 'si-user-message']);

export const contentFormatterMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const recorder = tree.beginUpdate(filePath);
      let sourceChanged = false;

      for (const component of findComponents(sourceFile)) {
        const rendererNames = getMarkdownRendererNames(component.declaration);
        if (!rendererNames.size) {
          continue;
        }

        let componentChanged = false;
        const template = getInlineTemplate(component.metadata);
        if (template) {
          const templateText = sourceFile.text.substring(
            template.getStart() + 1,
            template.getEnd() - 1
          );
          componentChanged ||= migrateContentFormatter(
            templateText,
            template.getStart() + 1,
            recorder,
            rendererNames
          );
        }

        for (const templateUrl of getTemplateUrls(component.metadata)) {
          const templatePath = join(dirname(filePath), templateUrl);
          if (processedTemplates.has(templatePath) || !tree.exists(templatePath)) {
            continue;
          }

          processedTemplates.add(templatePath);
          const templateContent = tree.read(templatePath)!.toString('utf-8');
          const templateRecorder = tree.beginUpdate(templatePath);
          const templateChanged = migrateContentFormatter(
            templateContent,
            0,
            templateRecorder,
            rendererNames
          );
          tree.commitUpdate(templateRecorder);
          componentChanged ||= templateChanged;
        }

        if (componentChanged) {
          addMarkdownToComponentImports(component.metadata, recorder);
          sourceChanged = true;
        }
      }

      if (sourceChanged) {
        const importChange = applyImport(
          sourceFile,
          'SiMarkdownComponent',
          '@siemens/element-ng/markdown'
        );
        if (importChange) {
          recorder.insertLeft(importChange.start, importChange.replacement);
        }
      }

      tree.commitUpdate(recorder);
    }

    return tree;
  };
};

interface ComponentMetadata {
  declaration: ts.ClassDeclaration;
  metadata: ts.ObjectLiteralExpression;
}

const findComponents = (sourceFile: ts.SourceFile): ComponentMetadata[] => {
  const components: ComponentMetadata[] = [];

  sourceFile.forEachChild(node => {
    if (!ts.isClassDeclaration(node)) {
      return;
    }

    const decorator = ts.getDecorators(node)?.find(candidate => {
      const expression = candidate.expression;
      return (
        ts.isCallExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        expression.expression.text === 'Component'
      );
    });
    const expression = decorator?.expression;
    const metadata =
      expression &&
      ts.isCallExpression(expression) &&
      ts.isObjectLiteralExpression(expression.arguments[0])
        ? expression.arguments[0]
        : undefined;

    if (metadata) {
      components.push({ declaration: node, metadata });
    }
  });

  return components;
};

const getMarkdownRendererNames = (component: ts.ClassDeclaration): Set<string> => {
  const names = new Set<string>();

  for (const member of component.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      ts.isIdentifier(member.name) &&
      member.initializer &&
      ts.isCallExpression(member.initializer) &&
      ts.isIdentifier(member.initializer.expression) &&
      member.initializer.expression.text === 'getMarkdownRenderer'
    ) {
      names.add(member.name.text);
    }
  }

  return names;
};

const getInlineTemplate = (
  metadata: ts.ObjectLiteralExpression
): ts.NoSubstitutionTemplateLiteral | ts.StringLiteral | undefined => {
  const template = metadata.properties.find(property => {
    return (
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'template'
    );
  });

  if (
    template &&
    ts.isPropertyAssignment(template) &&
    (ts.isNoSubstitutionTemplateLiteral(template.initializer) ||
      ts.isStringLiteral(template.initializer))
  ) {
    return template.initializer;
  }

  return undefined;
};

const getTemplateUrls = (metadata: ts.ObjectLiteralExpression): string[] => {
  return metadata.properties.flatMap(property => {
    if (
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'templateUrl' &&
      ts.isStringLiteral(property.initializer)
    ) {
      return property.initializer.text;
    }

    return [];
  });
};

const migrateContentFormatter = (
  template: string,
  offset: number,
  recorder: UpdateRecorder,
  rendererNames: Set<string>
): boolean => {
  let changed = false;

  findElement(template, element => MESSAGE_SELECTORS.has(element.name)).forEach(element => {
    const content = element.attrs.find(attribute => {
      return attribute.name === 'content' || attribute.name === '[content]';
    });
    const formatter = element.attrs.find(attribute => attribute.name === '[contentFormatter]');

    if (
      !content ||
      !formatter ||
      !rendererNames.has(formatter.value.trim()) ||
      !hasOnlyWhitespaceContent(element, template)
    ) {
      return;
    }

    const markdownAttribute = content.name === '[content]' ? '[markdown]' : 'markdown';
    const openingTag = removeAttributes(element, [content, formatter]);
    const replacement = `${openingTag}<si-markdown ${markdownAttribute}="${content.value}" /></${element.name}>`;
    const start = element.sourceSpan.start.offset + offset;
    const length = element.sourceSpan.end.offset - element.sourceSpan.start.offset;

    recorder.remove(start, length);
    recorder.insertLeft(start, replacement);
    changed = true;
  });

  return changed;
};

const hasOnlyWhitespaceContent = (element: Element, template: string): boolean => {
  const openingTag = element.startSourceSpan.toString();
  if (openingTag.trimEnd().endsWith('/>')) {
    return true;
  }

  if (!element.endSourceSpan) {
    return false;
  }

  return (
    template
      .substring(element.startSourceSpan.end.offset, element.endSourceSpan.start.offset)
      .trim().length === 0
  );
};

const removeAttributes = (element: Element, attributes: Element['attrs']): string => {
  const elementStart = element.startSourceSpan.start.offset;
  let openingTag = element.startSourceSpan.toString();

  const ranges = attributes
    .map(attribute => ({
      start: attribute.sourceSpan.start.offset - elementStart,
      end: attribute.sourceSpan.end.offset - elementStart
    }))
    .sort((first, second) => second.start - first.start);

  for (const range of ranges) {
    let start = range.start;
    while (start > 0 && /\s/.test(openingTag[start - 1])) {
      start--;
    }
    openingTag = openingTag.slice(0, start) + openingTag.slice(range.end);
  }

  return openingTag.replace(/\s*\/>\s*$/, '>');
};

const addMarkdownToComponentImports = (
  metadata: ts.ObjectLiteralExpression,
  recorder: UpdateRecorder
): void => {
  const imports = metadata.properties.find(property => {
    return (
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'imports' &&
      ts.isArrayLiteralExpression(property.initializer)
    );
  });

  if (
    imports &&
    ts.isPropertyAssignment(imports) &&
    ts.isArrayLiteralExpression(imports.initializer)
  ) {
    const importNames = imports.initializer.elements;
    if (
      importNames.some(
        element => ts.isIdentifier(element) && element.text === 'SiMarkdownComponent'
      )
    ) {
      return;
    }

    recorder.insertLeft(
      imports.initializer.end - 1,
      `${importNames.length ? ', ' : ''}SiMarkdownComponent`
    );
    return;
  }

  const lastProperty = metadata.properties.at(-1);
  recorder.insertLeft(
    lastProperty ? lastProperty.end : metadata.getStart() + 1,
    `${lastProperty ? ',' : ''}\n  imports: [SiMarkdownComponent]`
  );
};
