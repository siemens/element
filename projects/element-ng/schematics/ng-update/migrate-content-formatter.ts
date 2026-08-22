/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { Element } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { removeImportSpecifiers } from '../migrations/utilities/import-removal.js';
import {
  applyImport,
  discoverSourceFiles,
  findElement,
  getImportSpecifiers
} from '../utils/index.js';

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

        const migrationResult = createMigrationResult();
        const template = getInlineTemplate(component.metadata);
        if (template) {
          const templateText = sourceFile.text.substring(
            template.getStart() + 1,
            template.getEnd() - 1
          );
          mergeMigrationResult(
            migrationResult,
            migrateContentFormatter(templateText, template.getStart() + 1, recorder, rendererNames)
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
          const templateResult = migrateContentFormatter(
            templateContent,
            0,
            templateRecorder,
            rendererNames
          );
          tree.commitUpdate(templateRecorder);
          mergeMigrationResult(migrationResult, templateResult);
        }

        if (migrationResult.migratedRendererNames.size > 0) {
          const removedRendererProperties = removeUnusedRendererProperties(
            component.declaration,
            migrationResult,
            recorder
          );
          removeUnusedMarkdownRendererImports(sourceFile, removedRendererProperties, recorder);
          removeUnusedDomSanitizerImports(sourceFile, removedRendererProperties, recorder);
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
): ContentFormatterMigrationResult => {
  const result = createMigrationResult();

  findElement(template, () => true).forEach(element => {
    const formatter = element.attrs.find(attribute => attribute.name === '[contentFormatter]');
    const formatterName = formatter?.value.trim();
    if (!formatterName || !rendererNames.has(formatterName)) {
      return;
    }

    const content = element.attrs.find(attribute => {
      return attribute.name === 'content' || attribute.name === '[content]';
    });

    if (
      !MESSAGE_SELECTORS.has(element.name) ||
      !content ||
      !formatter ||
      !hasOnlyWhitespaceContent(element, template)
    ) {
      result.retainedRendererNames.add(formatterName);
      return;
    }

    const markdownAttribute = content.name === '[content]' ? '[markdown]' : 'markdown';
    const openingTag = removeAttributes(element, [content, formatter]);
    const replacement = `${openingTag}<si-markdown ${markdownAttribute}="${content.value}" /></${element.name}>`;
    const start = element.sourceSpan.start.offset + offset;
    const length = element.sourceSpan.end.offset - element.sourceSpan.start.offset;

    recorder.remove(start, length);
    recorder.insertLeft(start, replacement);
    result.migratedRendererNames.add(formatterName);
  });

  return result;
};

interface ContentFormatterMigrationResult {
  migratedRendererNames: Set<string>;
  retainedRendererNames: Set<string>;
}

const createMigrationResult = (): ContentFormatterMigrationResult => ({
  migratedRendererNames: new Set<string>(),
  retainedRendererNames: new Set<string>()
});

const mergeMigrationResult = (
  target: ContentFormatterMigrationResult,
  source: ContentFormatterMigrationResult
): void => {
  source.migratedRendererNames.forEach(name => target.migratedRendererNames.add(name));
  source.retainedRendererNames.forEach(name => target.retainedRendererNames.add(name));
};

const removeUnusedRendererProperties = (
  component: ts.ClassDeclaration,
  migrationResult: ContentFormatterMigrationResult,
  recorder: UpdateRecorder
): ts.PropertyDeclaration[] => {
  const removedProperties: ts.PropertyDeclaration[] = [];

  for (const property of component.members) {
    if (
      !ts.isPropertyDeclaration(property) ||
      !ts.isIdentifier(property.name) ||
      !migrationResult.migratedRendererNames.has(property.name.text) ||
      migrationResult.retainedRendererNames.has(property.name.text) ||
      hasReferenceOutsideProperty(component, property.name.text, property)
    ) {
      continue;
    }

    recorder.remove(property.getFullStart(), property.getEnd() - property.getFullStart());
    removedProperties.push(property);
  }

  return removedProperties;
};

const hasReferenceOutsideProperty = (
  component: ts.ClassDeclaration,
  name: string,
  excludedProperty: ts.PropertyDeclaration
): boolean => {
  let referenced = false;

  const visit = (node: ts.Node): void => {
    if (node === excludedProperty || referenced) {
      return;
    }

    if (ts.isIdentifier(node) && node.text === name) {
      referenced = true;
      return;
    }

    ts.forEachChild(node, visit);
  };

  component.forEachChild(visit);
  return referenced;
};

const removeUnusedMarkdownRendererImports = (
  sourceFile: ts.SourceFile,
  removedProperties: ts.PropertyDeclaration[],
  recorder: UpdateRecorder
): void => {
  const getMarkdownRendererImports = getImportSpecifiers(
    sourceFile,
    '@siemens/element-ng/markdown-renderer',
    'getMarkdownRenderer'
  );

  if (
    getMarkdownRendererImports.length &&
    !hasIdentifierReferenceOutsideNodes(
      sourceFile,
      getMarkdownRendererImports.map(specifier => specifier.name.text),
      removedProperties
    )
  ) {
    removeImports(sourceFile, getMarkdownRendererImports, recorder);
  }
};

const removeUnusedDomSanitizerImports = (
  sourceFile: ts.SourceFile,
  removedProperties: ts.PropertyDeclaration[],
  recorder: UpdateRecorder
): void => {
  const domSanitizerImports = getImportSpecifiers(
    sourceFile,
    '@angular/platform-browser',
    'DomSanitizer'
  );

  if (
    domSanitizerImports.length &&
    !hasIdentifierReferenceOutsideNodes(
      sourceFile,
      domSanitizerImports.map(specifier => specifier.name.text),
      removedProperties
    )
  ) {
    removeImports(sourceFile, domSanitizerImports, recorder);
  }
};

const hasIdentifierReferenceOutsideNodes = (
  sourceFile: ts.SourceFile,
  names: string[],
  excludedNodes: ts.Node[]
): boolean => {
  let referenced = false;
  const namesToFind = new Set(names);

  const visit = (node: ts.Node): void => {
    if (excludedNodes.some(excludedNode => node === excludedNode) || referenced) {
      return;
    }

    if (ts.isIdentifier(node) && namesToFind.has(node.text) && !ts.isImportSpecifier(node.parent)) {
      referenced = true;
      return;
    }

    ts.forEachChild(node, visit);
  };

  sourceFile.forEachChild(visit);
  return referenced;
};

const removeImports = (
  sourceFile: ts.SourceFile,
  specifiers: ts.ImportSpecifier[],
  recorder: UpdateRecorder
): void => {
  const specifiersByImport = new Map<ts.ImportDeclaration, ts.ImportSpecifier[]>();
  for (const specifier of specifiers) {
    const importDeclaration = specifier.parent.parent.parent;
    if (!ts.isImportDeclaration(importDeclaration)) {
      continue;
    }
    const matchingSpecifiers = specifiersByImport.get(importDeclaration) ?? [];
    matchingSpecifiers.push(specifier);
    specifiersByImport.set(importDeclaration, matchingSpecifiers);
  }

  const printer = ts.createPrinter();
  for (const [importDeclaration, importedSpecifiers] of specifiersByImport) {
    const edit = removeImportSpecifiers(sourceFile, importDeclaration, importedSpecifiers);
    recorder.remove(edit.start, edit.width);
    if (edit.newNode) {
      recorder.insertLeft(
        edit.start,
        printer.printNode(ts.EmitHint.Unspecified, edit.newNode, sourceFile)
      );
    }
  }
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
