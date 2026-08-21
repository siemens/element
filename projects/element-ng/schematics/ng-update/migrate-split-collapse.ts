/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import type { Attribute, Element } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import {
  discoverSourceFiles,
  findElement,
  getInlineTemplates,
  getTemplateUrl
} from '../utils/index.js';

const collapseValues = new Map([
  ['start', 'to-start'],
  ['end', 'to-end']
]);
const collapseDirectionNames = ['collapseDirection', '[collapseDirection]'];
const collapsibleNames = ['collapsible', '[collapsible]'];
const showCollapseButtonNames = ['showCollapseButton', '[showCollapseButton]'];

export const splitCollapseMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const recorder = tree.beginUpdate(filePath);

      for (const template of getInlineTemplates(sourceFile)) {
        migrateSplitCollapseTemplate(
          sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
          template.getStart() + 1,
          recorder
        );
      }
      migrateCollapseToLiterals(sourceFile, recorder);
      tree.commitUpdate(recorder);

      for (const templateUrl of getTemplateUrl(sourceFile)) {
        const templatePath = join(dirname(filePath), templateUrl);
        if (processedTemplates.has(templatePath) || !tree.exists(templatePath)) {
          continue;
        }

        processedTemplates.add(templatePath);
        const templateRecorder = tree.beginUpdate(templatePath);
        migrateSplitCollapseTemplate(
          tree.read(templatePath)!.toString('utf-8'),
          0,
          templateRecorder
        );
        tree.commitUpdate(templateRecorder);
      }
    }

    return tree;
  };
};

const migrateSplitCollapseTemplate = (
  template: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  findElement(template, element => element.name === 'si-split-part').forEach(element => {
    migrateSplitCollapseElement(template, element, offset, recorder);
  });
};

const migrateSplitCollapseElement = (
  template: string,
  element: Element,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const showCollapseButton = element.attrs.find(attribute =>
    showCollapseButtonNames.includes(attribute.name)
  );
  const collapseDirections = element.attrs.filter(attribute =>
    collapseDirectionNames.includes(attribute.name)
  );
  const collapseDirection = collapseDirections[0];
  const collapsible = element.attrs.find(attribute => collapsibleNames.includes(attribute.name));

  if (showCollapseButton) {
    const staticValue = getStaticBooleanValue(showCollapseButton);
    if (staticValue === undefined) {
      const target = collapsible ?? collapseDirection ?? showCollapseButton;
      replaceAttribute(
        target,
        formatBoundAttribute(
          'collapsible',
          `${getBooleanAttributeCondition(getShowCollapseButtonExpression(showCollapseButton))} ? ${getCollapsibleExpression(collapsible ?? collapseDirection)} : undefined`
        ),
        offset,
        recorder
      );
      if (target !== showCollapseButton) {
        removeAttribute(template, showCollapseButton, offset, recorder);
      }
      collapseDirections
        .filter(attribute => attribute !== target)
        .forEach(attribute => removeAttribute(template, attribute, offset, recorder));
      return;
    }

    removeAttribute(template, showCollapseButton, offset, recorder);
    if (!staticValue && !collapsible) {
      collapseDirections.forEach(attribute =>
        removeAttribute(template, attribute, offset, recorder)
      );
      return;
    }
  }

  if (collapsible) {
    collapseDirections.forEach(attribute => removeAttribute(template, attribute, offset, recorder));
    return;
  }

  if (collapseDirections.length > 0) {
    collapseDirections.forEach(attribute => migrateCollapseDirection(attribute, offset, recorder));
  } else {
    insertAttribute(template, element, 'collapsible="to-start"', offset, recorder);
  }
};

const migrateCollapseDirection = (
  attribute: Attribute,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const isBound = attribute.name.startsWith('[');
  const attributeNameOffset = attribute.sourceSpan.start.offset + offset + (isBound ? 1 : 0);
  recorder.remove(attributeNameOffset, 'collapseDirection'.length);
  recorder.insertLeft(attributeNameOffset, 'collapsible');

  const value = isBound ? getStringLiteral(attribute.value) : collapseValues.get(attribute.value);
  if (!value || !attribute.valueSpan) {
    return;
  }

  const valueOffset = attribute.valueSpan.start.offset + offset;
  recorder.remove(valueOffset, attribute.valueSpan.end.offset - attribute.valueSpan.start.offset);
  recorder.insertLeft(valueOffset, isBound ? `'${value}'` : value);
};

const getCollapsibleExpression = (attribute: Attribute | undefined): string => {
  if (!attribute) {
    return `'to-start'`;
  }

  if (attribute.name.startsWith('[')) {
    const migratedLiteral = getStringLiteral(attribute.value);
    return migratedLiteral ? `'${migratedLiteral}'` : `(${attribute.value})`;
  }

  return `'${collapseValues.get(attribute.value) ?? attribute.value}'`;
};

const getStaticBooleanValue = (attribute: Attribute): boolean | undefined => {
  if (!attribute.name.startsWith('[')) {
    if (/^\s*{{[\s\S]*}}\s*$/.test(attribute.value)) {
      return undefined;
    }
    return attribute.value !== 'false';
  }

  const initializer = getExpression(attribute.value);
  if (!initializer) {
    return undefined;
  }

  if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (
    initializer.kind === ts.SyntaxKind.FalseKeyword ||
    initializer.kind === ts.SyntaxKind.NullKeyword ||
    (ts.isIdentifier(initializer) && initializer.text === 'undefined') ||
    (ts.isStringLiteral(initializer) && initializer.text === 'false')
  ) {
    return false;
  }
  if (ts.isStringLiteral(initializer) || ts.isNumericLiteral(initializer)) {
    return true;
  }

  return undefined;
};

const getShowCollapseButtonExpression = (attribute: Attribute): string => {
  if (attribute.name.startsWith('[')) {
    return attribute.value;
  }

  return attribute.value.replace(/^\s*{{\s*|\s*}}\s*$/g, '');
};

const getBooleanAttributeCondition = (expression: string): string =>
  `![false, null, undefined, 'false'].includes($any(${expression}))`;

const formatBoundAttribute = (name: string, expression: string): string => {
  const quote = expression.includes('"') && !expression.includes("'") ? "'" : '"';
  const escapedExpression =
    quote === '"' ? expression.replaceAll('"', '&quot;') : expression.replaceAll("'", '&#39;');
  return `[${name}]=${quote}${escapedExpression}${quote}`;
};

const replaceAttribute = (
  attribute: Attribute,
  replacement: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const start = attribute.sourceSpan.start.offset + offset;
  recorder.remove(start, attribute.sourceSpan.end.offset - attribute.sourceSpan.start.offset);
  recorder.insertLeft(start, replacement);
};

const insertAttribute = (
  template: string,
  element: Element,
  attribute: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const selfClosing = element.startSourceSpan.toString().endsWith('/>');
  const insertOffset = element.startSourceSpan.end.offset - (selfClosing ? 2 : 1);
  const prefix = /\s/.test(template[insertOffset - 1]) ? '' : ' ';
  recorder.insertLeft(insertOffset + offset, `${prefix}${attribute}${selfClosing ? ' ' : ''}`);
};

const removeAttribute = (
  template: string,
  attribute: { sourceSpan: { start: { offset: number }; end: { offset: number } } },
  offset: number,
  recorder: UpdateRecorder
): void => {
  const start = attribute.sourceSpan.start.offset;
  const end = attribute.sourceSpan.end.offset;
  const lineStart = template.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = template.indexOf('\n', end);
  const endOfLine = lineEnd === -1 ? template.length : lineEnd;
  if (
    template.slice(lineStart, start).trim() === '' &&
    template.slice(end, endOfLine).trim() === ''
  ) {
    const removeEnd = lineEnd === -1 ? endOfLine : lineEnd + 1;
    recorder.remove(lineStart + offset, removeEnd - lineStart);
    return;
  }

  const removeStart = start > 0 && /\s/.test(template[start - 1]) ? start - 1 : start;
  recorder.remove(removeStart + offset, attribute.sourceSpan.end.offset - removeStart);
};

const getStringLiteral = (value: string): string | undefined => {
  const initializer = getExpression(value);
  return initializer && ts.isStringLiteral(initializer)
    ? collapseValues.get(initializer.text)
    : undefined;
};

const getExpression = (value: string): ts.Expression | undefined => {
  const statement = ts.createSourceFile(
    'template-expression.ts',
    `const value = ${value};`,
    ts.ScriptTarget.Latest,
    true
  ).statements[0];
  if (!statement || !ts.isVariableStatement(statement)) {
    return undefined;
  }

  return statement.declarationList.declarations[0]?.initializer;
};

const migrateCollapseToLiterals = (sourceFile: ts.SourceFile, recorder: UpdateRecorder): void => {
  const collapseToTypeNames = getCollapseToTypeNames(sourceFile);
  if (collapseToTypeNames.size === 0) {
    return;
  }

  const collapseToVariables = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      (isCollapseToType(node.type, collapseToTypeNames) ||
        isCollapseToExpression(node.initializer, collapseToTypeNames))
    ) {
      collapseToVariables.add(node.name.text);
      replaceCollapseLiterals(node.initializer, recorder);
    }

    if (
      ts.isPropertyDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      (isCollapseToType(node.type, collapseToTypeNames) ||
        isCollapseToExpression(node.initializer, collapseToTypeNames))
    ) {
      collapseToVariables.add(node.name.text);
      replaceCollapseLiterals(node.initializer, recorder);
    }

    if (
      ts.isParameter(node) &&
      ts.isIdentifier(node.name) &&
      isCollapseToType(node.type, collapseToTypeNames)
    ) {
      collapseToVariables.add(node.name.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  migrateCollapseToSetCalls(sourceFile, collapseToVariables, recorder);
};

const getCollapseToTypeNames = (sourceFile: ts.SourceFile): Set<string> => {
  const names = new Set<string>();
  sourceFile.statements.forEach(statement => {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      return;
    }

    const importPath = statement.moduleSpecifier.text;
    if (!importPath.startsWith('@siemens/element-ng/split')) {
      return;
    }

    const imports = statement.importClause?.namedBindings;
    if (!imports || !ts.isNamedImports(imports)) {
      return;
    }

    imports.elements.forEach(importSpecifier => {
      if ((importSpecifier.propertyName?.text ?? importSpecifier.name.text) === 'CollapseTo') {
        names.add(importSpecifier.name.text);
      }
    });
  });

  let addedName = true;
  while (addedName) {
    addedName = false;
    for (const statement of sourceFile.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) &&
        isCollapseToType(statement.type, names) &&
        !names.has(statement.name.text)
      ) {
        names.add(statement.name.text);
        addedName = true;
      }
    }
  }

  return names;
};

const isCollapseToType = (node: ts.TypeNode | undefined, names: Set<string>): boolean => {
  if (!node) {
    return false;
  }

  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    return (
      names.has(node.typeName.text) ||
      node.typeArguments?.some(typeArgument => isCollapseToType(typeArgument, names)) === true
    );
  }

  if (ts.isArrayTypeNode(node)) {
    return isCollapseToType(node.elementType, names);
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return isCollapseToType(node.type, names);
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.some(type => isCollapseToType(type, names));
  }

  return false;
};

const isCollapseToExpression = (node: ts.Expression | undefined, names: Set<string>): boolean =>
  !!node &&
  ts.isCallExpression(node) &&
  node.typeArguments?.some(typeArgument => isCollapseToType(typeArgument, names)) === true;

const migrateCollapseToSetCalls = (
  sourceFile: ts.SourceFile,
  collapseToVariables: Set<string>,
  recorder: UpdateRecorder
): void => {
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      (node.expression.name.text === 'set' || node.expression.name.text === 'update') &&
      collapseToVariables.has(getRootIdentifier(node.expression.expression) ?? '')
    ) {
      node.arguments.forEach(argument => replaceCollapseLiterals(argument, recorder));
    }

    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      collapseToVariables.has(getRootIdentifier(node.left) ?? '')
    ) {
      replaceCollapseLiterals(node.right, recorder);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
};

const getRootIdentifier = (node: ts.Expression): string | undefined => {
  if (ts.isIdentifier(node)) {
    return node.text;
  }

  if (ts.isPropertyAccessExpression(node)) {
    return node.name.text;
  }

  return undefined;
};

const replaceCollapseLiterals = (
  node: ts.Expression | undefined,
  recorder: UpdateRecorder
): void => {
  if (!node) {
    return;
  }

  const visit = (child: ts.Node): void => {
    if (ts.isStringLiteral(child)) {
      const replacement = collapseValues.get(child.text);
      if (replacement) {
        recorder.remove(child.getStart() + 1, child.getWidth() - 2);
        recorder.insertLeft(child.getStart() + 1, replacement);
      }
    }
    ts.forEachChild(child, visit);
  };

  visit(node);
};
