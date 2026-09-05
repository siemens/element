/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import type { Attribute } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { removeImportSpecifiers } from '../migrations/utilities/import-removal.js';
import {
  discoverSourceFiles,
  findElement,
  getInlineTemplates,
  getTemplateUrl
} from '../utils/index.js';

const splitImportPath = /^@(siemens|simpl)\/element-ng\/split(?:\/index)?$/;
const scaleAttributeNames = ['scale', '[scale]', 'bind-scale'];
const unitAttributeNames = ['unit', '[unit]', 'bind-unit'];

export const splitScaleMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const recorder = tree.beginUpdate(filePath);

      migrateScaleTypes(sourceFile, recorder);
      for (const template of getInlineTemplates(sourceFile)) {
        migrateScaleTemplate(
          sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
          template.getStart() + 1,
          recorder
        );
      }
      tree.commitUpdate(recorder);

      for (const templateUrl of getTemplateUrl(sourceFile)) {
        const templatePath = join(dirname(filePath), templateUrl);
        if (processedTemplates.has(templatePath) || !tree.exists(templatePath)) {
          continue;
        }

        processedTemplates.add(templatePath);
        const templateRecorder = tree.beginUpdate(templatePath);
        migrateScaleTemplate(tree.read(templatePath)!.toString('utf-8'), 0, templateRecorder);
        tree.commitUpdate(templateRecorder);
      }
    }

    return tree;
  };
};

const migrateScaleTemplate = (template: string, offset: number, recorder: UpdateRecorder): void => {
  findElement(template, element => element.name === 'si-split-part').forEach(element => {
    const scale = element.attrs.find(attribute => scaleAttributeNames.includes(attribute.name));
    if (!scale) {
      return;
    }

    const hasUnit = element.attrs.some(attribute => unitAttributeNames.includes(attribute.name));
    if (hasUnit) {
      removeAttribute(template, scale, offset, recorder);
      return;
    }

    replaceAttribute(scale, getUnitAttribute(scale), offset, recorder);
  });
};

const getUnitAttribute = (attribute: Attribute): string => {
  if (attribute.name === 'scale') {
    const interpolation = /^\s*{{([\s\S]*)}}\s*$/.exec(attribute.value);
    if (interpolation) {
      return formatBoundAttribute('unit', getUnitExpression(interpolation[1]!.trim()));
    }

    return `unit="${getScaleUnit(attribute.value)}"`;
  }

  const expression = getExpression(attribute.value);
  if (expression && ts.isStringLiteral(expression)) {
    return `unit="${getScaleUnit(expression.text)}"`;
  }

  return formatBoundAttribute('unit', getUnitExpression(attribute.value));
};

const getScaleUnit = (value: string): 'px' | 'fr' => (value.trim() === 'none' ? 'px' : 'fr');

const getUnitExpression = (expression: string): string => {
  const value = expression.trim();
  return `(${value}) === 'none' ? 'px' : 'fr'`;
};

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

const removeAttribute = (
  template: string,
  attribute: Attribute,
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

  const removeStart = start > 0 && /\s/.test(template[start - 1]!) ? start - 1 : start;
  recorder.remove(removeStart + offset, end - removeStart);
};

const migrateScaleTypes = (sourceFile: ts.SourceFile, recorder: UpdateRecorder): void => {
  const scaleImports = sourceFile.statements.flatMap(statement => {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !splitImportPath.test(statement.moduleSpecifier.text)
    ) {
      return [];
    }

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      return [];
    }

    return namedBindings.elements
      .filter(element => (element.propertyName?.text ?? element.name.text) === 'Scale')
      .map(element => ({ declaration: statement, element }));
  });

  if (!scaleImports.length) {
    return;
  }

  const scaleTypeNames = new Set(scaleImports.map(({ element }) => element.name.text));
  collectScaleTypeAliases(sourceFile, scaleTypeNames);

  const replacements = new Map<string, string>();
  const importEdits: { start: number; width: number; replacement?: string }[] = [];
  const existingUnit = findSplitUnitImport(sourceFile);

  for (const { declaration, element } of scaleImports) {
    if (existingUnit) {
      replacements.set(element.name.text, existingUnit.name.text);
      const edit = removeImportSpecifiers(sourceFile, declaration, [element]);
      importEdits.push({
        start: edit.start,
        width: edit.width,
        replacement: edit.newNode
          ? ts.createPrinter().printNode(ts.EmitHint.Unspecified, edit.newNode, sourceFile)
          : undefined
      });
      continue;
    }

    if (element.propertyName) {
      importEdits.push({
        start: element.propertyName.getStart(sourceFile),
        width: element.propertyName.getWidth(sourceFile),
        replacement: 'SplitUnit'
      });
      continue;
    }

    importEdits.push({
      start: element.name.getStart(sourceFile),
      width: element.name.getWidth(sourceFile),
      replacement: 'SplitUnit'
    });
    replacements.set(element.name.text, 'SplitUnit');
  }

  for (const edit of importEdits) {
    recorder.remove(edit.start, edit.width);
    if (edit.replacement) {
      recorder.insertLeft(edit.start, edit.replacement);
    }
  }

  replaceScaleIdentifiers(sourceFile, replacements, recorder);
  replaceScaleLiterals(sourceFile, scaleTypeNames, recorder);
};

const findSplitUnitImport = (sourceFile: ts.SourceFile): ts.ImportSpecifier | undefined => {
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !splitImportPath.test(statement.moduleSpecifier.text)
    ) {
      continue;
    }

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    const unit = namedBindings.elements.find(
      element => (element.propertyName?.text ?? element.name.text) === 'SplitUnit'
    );
    if (unit) {
      return unit;
    }
  }

  return undefined;
};

const collectScaleTypeAliases = (sourceFile: ts.SourceFile, names: Set<string>): void => {
  let changed = true;
  while (changed) {
    changed = false;
    for (const statement of sourceFile.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) &&
        typeContainsScale(statement.type, names) &&
        !names.has(statement.name.text)
      ) {
        names.add(statement.name.text);
        changed = true;
      }
    }
  }
};

const typeContainsScale = (type: ts.TypeNode, names: Set<string>): boolean => {
  let contains = false;
  const visit = (node: ts.Node): void => {
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      names.has(node.typeName.text)
    ) {
      contains = true;
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(type);
  return contains;
};

const replaceScaleIdentifiers = (
  sourceFile: ts.SourceFile,
  replacements: Map<string, string>,
  recorder: UpdateRecorder
): void => {
  if (!replacements.size) {
    return;
  }

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      return;
    }

    if (ts.isIdentifier(node)) {
      const replacement = replacements.get(node.text);
      if (replacement) {
        recorder.remove(node.getStart(sourceFile), node.getWidth(sourceFile));
        recorder.insertLeft(node.getStart(sourceFile), replacement);
        return;
      }
    }

    ts.forEachChild(node, visit);
  };

  sourceFile.statements.forEach(statement => visit(statement));
};

const replaceScaleLiterals = (
  sourceFile: ts.SourceFile,
  scaleTypeNames: Set<string>,
  recorder: UpdateRecorder
): void => {
  const typedNames = new Set<string>();
  const literals = new Set<ts.StringLiteral>();

  const collectLiterals = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) && (node.text === 'auto' || node.text === 'none')) {
      literals.add(node);
      return;
    }
    ts.forEachChild(node, collectLiterals);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.type && typeContainsScale(node.type, scaleTypeNames)) {
        typedNames.add(node.name.text);
        if (node.initializer) {
          collectLiterals(node.initializer);
        }
      }

      if (
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        node.initializer.typeArguments?.some(type => typeContainsScale(type, scaleTypeNames))
      ) {
        typedNames.add(node.name.text);
        collectLiterals(node.initializer);
      }
    }

    if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.type && typeContainsScale(node.type, scaleTypeNames)) {
        typedNames.add(node.name.text);
        if (node.initializer) {
          collectLiterals(node.initializer);
        }
      }
    }

    if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
      if (node.type && typeContainsScale(node.type, scaleTypeNames)) {
        typedNames.add(node.name.text);
      }
    }

    const isFunctionWithBody =
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node);
    if (isFunctionWithBody && node.type && typeContainsScale(node.type, scaleTypeNames)) {
      if (node.body) {
        const collectReturns = (child: ts.Node): void => {
          if (ts.isReturnStatement(child) && child.expression) {
            collectLiterals(child.expression);
          }
          ts.forEachChild(child, collectReturns);
        };
        collectReturns(node.body);
      }
    }

    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const root = getRootIdentifier(node.left);
      if (root && typedNames.has(root)) {
        collectLiterals(node.right);
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      (node.expression.name.text === 'set' || node.expression.name.text === 'update') &&
      typedNames.has(getRootIdentifier(node.expression.expression) ?? '')
    ) {
      node.arguments.forEach(collectLiterals);
    }

    ts.forEachChild(node, visit);
  };

  sourceFile.statements.filter(statement => !ts.isImportDeclaration(statement)).forEach(visit);

  literals.forEach(literal => {
    const replacement = literal.text === 'auto' ? 'fr' : 'px';
    const start = literal.getStart(sourceFile) + 1;
    recorder.remove(start, literal.getWidth(sourceFile) - 2);
    recorder.insertLeft(start, replacement);
  });
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

const getExpression = (value: string): ts.Expression | undefined => {
  const statement = ts.createSourceFile(
    'split-scale-expression.ts',
    `const value = ${value};`,
    ts.ScriptTarget.Latest,
    true
  ).statements[0];

  if (!statement || !ts.isVariableStatement(statement)) {
    return undefined;
  }

  return statement.declarationList.declarations[0]?.initializer;
};
