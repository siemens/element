/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
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
    element.attrs
      .filter(
        attribute =>
          attribute.name === 'collapseDirection' || attribute.name === '[collapseDirection]'
      )
      .forEach(attribute => {
        const isBound = attribute.name.startsWith('[');
        const attributeNameOffset = attribute.sourceSpan.start.offset + offset + (isBound ? 1 : 0);
        recorder.remove(attributeNameOffset, 'collapseDirection'.length);
        recorder.insertLeft(attributeNameOffset, 'collapsible');

        const value = isBound
          ? getStringLiteral(attribute.value)
          : collapseValues.get(attribute.value);
        if (!value || !attribute.valueSpan) {
          return;
        }

        const valueOffset = attribute.valueSpan.start.offset + offset;
        recorder.remove(
          valueOffset,
          attribute.valueSpan.end.offset - attribute.valueSpan.start.offset
        );
        recorder.insertLeft(valueOffset, isBound ? `'${value}'` : value);
      });
  });
};

const getStringLiteral = (value: string): string | undefined => {
  const expression = ts.createSourceFile(
    'template-expression.ts',
    `const value = ${value};`,
    ts.ScriptTarget.Latest,
    true
  ).statements[0];
  if (!expression || !ts.isVariableStatement(expression)) {
    return undefined;
  }

  const initializer = expression.declarationList.declarations[0]?.initializer;
  return initializer && ts.isStringLiteral(initializer)
    ? collapseValues.get(initializer.text)
    : undefined;
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
