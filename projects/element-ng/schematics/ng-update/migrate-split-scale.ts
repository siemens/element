/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, SchematicContext, Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { Element, type Attribute } from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { removeImportSpecifiers } from '../migrations/utilities/import-removal.js';
import {
  discoverSourceFiles,
  findElement,
  formatBoundAttribute,
  getComponentTemplates,
  getImportSpecifiers,
  removeAttribute,
  replaceAttribute
} from '../utils/index.js';

const splitImportPath = /^@(siemens|simpl)\/element-ng\/split(?:\/index)?$/;
const scaleAttributeNames = ['scale', '[scale]', 'bind-scale'];
const unitAttributeNames = ['unit', '[unit]', 'bind-unit'];

export const splitScaleMigrationRule = (options: { path: string }): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const externalTemplates = new Map<string, Set<string>[]>();
    const manualSizeMigrationPaths = new Set<string>();
    const conflictingUnitPaths = new Set<string>();

    for await (const discoveredSourceFile of discoverSourceFiles(tree, context, options.path)) {
      const { path: filePath, sourceFile } = discoveredSourceFile;
      const scaleImports = getScaleImports(sourceFile);
      const scaleTypeNames = getScaleTypeNames(sourceFile, scaleImports);
      const recorder = tree.beginUpdate(filePath);

      migrateScaleTypes(
        sourceFile,
        recorder,
        scaleImports,
        scaleTypeNames,
        discoveredSourceFile.typeChecker
      );
      for (const template of getComponentTemplates(sourceFile)) {
        const scaleMemberNames = collectScaleMemberNames(template.component, scaleTypeNames);
        if (template.kind === 'inline') {
          const result = migrateScaleTemplate(
            sourceFile.text.substring(template.node.getStart() + 1, template.node.getEnd() - 1),
            template.node.getStart() + 1,
            recorder,
            [scaleMemberNames]
          );
          if (result.requiresManualSizeMigration) {
            manualSizeMigrationPaths.add(filePath);
          }
          if (result.hasConflictingUnit) {
            conflictingUnitPaths.add(filePath);
          }
        } else {
          const templatePath = join(dirname(filePath), template.url);
          const owners = externalTemplates.get(templatePath) ?? [];
          owners.push(scaleMemberNames);
          externalTemplates.set(templatePath, owners);
        }
      }
      tree.commitUpdate(recorder);
    }

    // A shared template must be migrated using all of its component contexts.
    for (const [templatePath, owners] of externalTemplates) {
      if (!tree.exists(templatePath)) {
        continue;
      }
      const recorder = tree.beginUpdate(templatePath);
      const result = migrateScaleTemplate(tree.readText(templatePath), 0, recorder, owners);
      if (result.requiresManualSizeMigration) {
        manualSizeMigrationPaths.add(templatePath);
      }
      if (result.hasConflictingUnit) {
        conflictingUnitPaths.add(templatePath);
      }
      tree.commitUpdate(recorder);
    }

    if (manualSizeMigrationPaths.size) {
      context.logger.warn(
        `The following files contain si-split-part elements with scale="none" whose relative size was supplied by [sizes]. Their relative size is preserved with unit="fr" because a pixel size cannot be inferred. Set size and unit="px" manually:\n${[
          ...manualSizeMigrationPaths
        ]
          .sort()
          .map(path => `- ${path}`)
          .join('\n')}`
      );
    }

    if (conflictingUnitPaths.size) {
      context.logger.warn(
        `The following files contain si-split-part elements with conflicting scale and unit values. The existing unit was preserved and scale removed. Review these parts manually:\n${[
          ...conflictingUnitPaths
        ]
          .sort()
          .map(path => `- ${path}`)
          .join('\n')}`
      );
    }

    return tree;
  };
};

const migrateScaleTemplate = (
  template: string,
  offset: number,
  recorder: UpdateRecorder,
  owners: Set<string>[]
): { requiresManualSizeMigration: boolean; hasConflictingUnit: boolean } => {
  const elements = findElement(
    template,
    element => element.name === 'si-split' || element.name === 'si-split-part'
  );
  const partsWithRelativeSizes = new Set<Element>();
  for (const split of elements) {
    if (split.name !== 'si-split' || !split.attrs.some(attribute => attribute.name === '[sizes]')) {
      continue;
    }

    for (const child of split.children) {
      if (
        child instanceof Element &&
        child.name === 'si-split-part' &&
        !child.attrs.some(attribute => attribute.name === 'size' || attribute.name === '[size]')
      ) {
        partsWithRelativeSizes.add(child);
      }
    }
  }

  let requiresManualSizeMigration = false;
  let hasConflictingUnit = false;
  elements.forEach(element => {
    if (element.name !== 'si-split-part') {
      return;
    }

    const scale = element.attrs.find(attribute => scaleAttributeNames.includes(attribute.name));
    if (!scale) {
      return;
    }

    const unit = element.attrs.find(attribute => unitAttributeNames.includes(attribute.name));
    if (unit) {
      hasConflictingUnit ||= hasConflictingStaticUnit(scale, unit);
      removeAttribute(template, scale, offset, recorder);
      return;
    }

    let replacement: string;
    if (
      partsWithRelativeSizes.has(element) &&
      scale.name === 'scale' &&
      scale.value.trim() === 'none'
    ) {
      replacement = 'unit="fr"';
      requiresManualSizeMigration = true;
    } else {
      const expression =
        scale.name === 'scale' ? getInterpolationExpression(scale.value) : scale.value;
      const replacements = new Set(owners.map(names => getUnitAttribute(scale, names, expression)));
      replacement = replacements.values().next().value!;
      if (replacements.size > 1 && expression !== undefined) {
        replacement = formatBoundAttribute(
          'unit',
          `['none', 'px'].includes(${expression}) ? 'px' : 'fr'`
        );
      }
    }
    replaceAttribute(scale, replacement, offset, recorder);
  });

  return { requiresManualSizeMigration, hasConflictingUnit };
};

const hasConflictingStaticUnit = (scale: Attribute, unit: Attribute): boolean => {
  const scaleValue = scale.value.trim();
  const unitValue = unit.value.trim();
  return (
    scale.name === 'scale' &&
    unit.name === 'unit' &&
    (scaleValue === 'auto' || scaleValue === 'none') &&
    (unitValue === 'fr' || unitValue === 'px') &&
    getScaleUnit(scaleValue) !== unitValue
  );
};

const getInterpolationExpression = (value: string): string | undefined =>
  /^\s*{{([\s\S]*)}}\s*$/.exec(value)?.[1]?.trim();

const getUnitAttribute = (
  attribute: Attribute,
  scaleMemberNames: Set<string>,
  expression: string | undefined
): string => {
  if (attribute.name === 'scale') {
    if (expression !== undefined) {
      return formatUnitBinding(expression, scaleMemberNames, getExpression(expression));
    }

    return `unit="${getScaleUnit(attribute.value)}"`;
  }

  const parsedExpression = getExpression(attribute.value);
  if (parsedExpression && ts.isStringLiteral(parsedExpression)) {
    return `unit="${getScaleUnit(parsedExpression.text)}"`;
  }

  return formatUnitBinding(attribute.value, scaleMemberNames, parsedExpression);
};

const getScaleUnit = (value: string): 'px' | 'fr' => (value.trim() === 'none' ? 'px' : 'fr');

const getUnitExpression = (expression: string): string => {
  const value = expression.trim();
  return `['none', 'px'].includes(${value}) ? 'px' : 'fr'`;
};

const formatUnitBinding = (
  expression: string,
  scaleMemberNames: Set<string>,
  parsedExpression: ts.Expression | undefined
): string => {
  const typedExpression = getTypedScaleExpression(parsedExpression, scaleMemberNames);
  const mappedExpression = getMappedScaleExpression(expression, parsedExpression);
  const value = typedExpression ?? mappedExpression ?? getUnitExpression(expression);
  return formatBoundAttribute('unit', value);
};

interface ScaleImport {
  declaration: ts.ImportDeclaration;
  element: ts.ImportSpecifier;
}

const getScaleImports = (sourceFile: ts.SourceFile): ScaleImport[] => {
  const importedSpecifiers = new Set(getImportSpecifiers(sourceFile, splitImportPath, 'Scale'));

  return sourceFile.statements.flatMap(statement => {
    if (!ts.isImportDeclaration(statement)) {
      return [];
    }

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      return [];
    }

    return namedBindings.elements
      .filter(element => importedSpecifiers.has(element))
      .map(element => ({ declaration: statement, element }));
  });
};

const getScaleTypeNames = (sourceFile: ts.SourceFile, scaleImports: ScaleImport[]): Set<string> => {
  const names = new Set(scaleImports.map(({ element }) => element.name.text));
  collectScaleTypeAliases(sourceFile, names);
  return names;
};

const collectScaleMemberNames = (
  component: ts.ClassDeclaration,
  scaleTypeNames: Set<string>
): Set<string> => {
  const names = new Set<string>();
  for (const node of component.members) {
    if (
      ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)
    ) {
      continue;
    }
    if (
      ts.isPropertyDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      (isScaleType(node.type, scaleTypeNames) ||
        isScaleInitializer(node.initializer, scaleTypeNames))
    ) {
      names.add(node.name.text);
    }

    if (
      (ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      isScaleType(node.type, scaleTypeNames)
    ) {
      names.add(node.name.text);
    }

    if (
      ts.isPropertyDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) &&
      isScaleType(node.initializer.type, scaleTypeNames)
    ) {
      names.add(node.name.text);
    }
  }
  return names;
};

const isScaleInitializer = (
  initializer: ts.Expression | undefined,
  scaleTypeNames: Set<string>
): boolean => {
  if (!initializer || !ts.isCallExpression(initializer)) {
    return false;
  }

  return (
    initializer.typeArguments?.some(typeArgument => isScaleType(typeArgument, scaleTypeNames)) ===
    true
  );
};

const migrateScaleTypes = (
  sourceFile: ts.SourceFile,
  recorder: UpdateRecorder,
  scaleImports: ScaleImport[],
  scaleTypeNames: Set<string>,
  typeChecker: ts.TypeChecker
): void => {
  if (!scaleImports.length) {
    return;
  }

  const replacements = new Map<string, string>();
  const importEdits: { start: number; width: number; replacement?: string }[] = [];
  const existingUnit = getImportSpecifiers(sourceFile, splitImportPath, 'SplitUnit')[0];

  for (const importDeclaration of new Set(scaleImports.map(({ declaration }) => declaration))) {
    const imports = scaleImports.filter(item => item.declaration === importDeclaration);

    if (existingUnit) {
      imports.forEach(({ element }) => replacements.set(element.name.text, existingUnit.name.text));
      const edit = removeImportSpecifiers(
        sourceFile,
        importDeclaration,
        imports.map(({ element }) => element)
      );
      importEdits.push({
        start: edit.start,
        width: edit.width,
        replacement: edit.newNode
          ? ts.createPrinter().printNode(ts.EmitHint.Unspecified, edit.newNode, sourceFile)
          : undefined
      });
      continue;
    }

    for (const { element } of imports) {
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
  }

  for (const edit of importEdits) {
    recorder.remove(edit.start, edit.width);
    if (edit.replacement) {
      recorder.insertLeft(edit.start, edit.replacement);
    }
  }

  replaceScaleIdentifiers(sourceFile, replacements, recorder);
  replaceScaleLiterals(sourceFile, scaleTypeNames, typeChecker, recorder);
};

const collectScaleTypeAliases = (sourceFile: ts.SourceFile, names: Set<string>): void => {
  let changed = true;
  while (changed) {
    changed = false;
    for (const statement of sourceFile.statements) {
      if (
        ts.isTypeAliasDeclaration(statement) &&
        isScaleType(statement.type, names) &&
        !names.has(statement.name.text)
      ) {
        names.add(statement.name.text);
        changed = true;
      }
    }
  }
};

const isScaleType = (type: ts.TypeNode | undefined, names: Set<string>): boolean => {
  if (!type) {
    return false;
  }

  if (ts.isTypeReferenceNode(type)) {
    return ts.isIdentifier(type.typeName) && names.has(type.typeName.text);
  }

  if (ts.isParenthesizedTypeNode(type)) {
    return isScaleType(type.type, names);
  }

  if (ts.isUnionTypeNode(type) || ts.isIntersectionTypeNode(type)) {
    return type.types.some(member => isScaleType(member, names));
  }

  return false;
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

    if (ts.isIdentifier(node) && isScaleTypeReference(node)) {
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

const isScaleTypeReference = (node: ts.Identifier): boolean => {
  const parent = node.parent;

  if (ts.isTypeReferenceNode(parent)) {
    return parent.typeName === node;
  }

  if (ts.isExpressionWithTypeArguments(parent)) {
    return parent.expression === node;
  }

  if (ts.isTypeQueryNode(parent)) {
    return parent.exprName === node;
  }

  if (ts.isExportSpecifier(parent)) {
    return !parent.propertyName || parent.propertyName === node;
  }

  return false;
};

const replaceScaleLiterals = (
  sourceFile: ts.SourceFile,
  scaleTypeNames: Set<string>,
  typeChecker: ts.TypeChecker,
  recorder: UpdateRecorder
): void => {
  const typedNames = new Set<string>();
  const literals = new Set<ts.StringLiteral>();

  const collectLiterals = (node: ts.Node | undefined): void => {
    if (!node) {
      return;
    }

    if (ts.isStringLiteral(node) && isScaleLiteral(node)) {
      literals.add(node);
      return;
    }

    if (ts.isParenthesizedExpression(node)) {
      collectLiterals(node.expression);
      return;
    }

    if (
      ts.isAsExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isNonNullExpression(node)
    ) {
      collectLiterals(node.expression);
      return;
    }

    if (ts.isConditionalExpression(node)) {
      collectLiterals(node.whenTrue);
      collectLiterals(node.whenFalse);
      return;
    }

    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      collectLiterals(node.body);
      return;
    }

    if (ts.isObjectLiteralExpression(node)) {
      node.properties.forEach(property => {
        if (!ts.isPropertyAssignment(property)) {
          return;
        }

        const contextualType = typeChecker.getContextualType(property.initializer);
        if (isScaleCheckerType(contextualType, scaleTypeNames)) {
          collectLiterals(property.initializer);
        }
      });
    }
  };

  const collectContextualLiterals = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) &&
      isScaleLiteral(node) &&
      isScaleCheckerType(typeChecker.getContextualType(node), scaleTypeNames)
    ) {
      literals.add(node);
    }
    ts.forEachChild(node, collectContextualLiterals);
  };

  const visit = (node: ts.Node): void => {
    if (
      (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) &&
      ts.isIdentifier(node.name)
    ) {
      const hasScaleType = isScaleType(node.type, scaleTypeNames);
      const scaleInitializer =
        node.initializer && ts.isCallExpression(node.initializer) ? node.initializer : undefined;
      const hasScaleInitializer =
        !!scaleInitializer && isScaleInitializer(scaleInitializer, scaleTypeNames);

      if (hasScaleType || hasScaleInitializer) {
        typedNames.add(node.name.text);
        if (hasScaleInitializer) {
          collectLiterals(scaleInitializer.arguments[0]);
        } else {
          collectLiterals(node.initializer);
        }
      }
    }

    if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
      if (isScaleType(node.type, scaleTypeNames)) {
        typedNames.add(node.name.text);
        collectLiterals(node.initializer);
      }
    }

    const isFunctionWithBody =
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node);
    if (isFunctionWithBody && isScaleType(node.type, scaleTypeNames)) {
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
  sourceFile.statements
    .filter(statement => !ts.isImportDeclaration(statement))
    .forEach(collectContextualLiterals);

  literals.forEach(literal => {
    const replacement = literal.text === 'auto' ? 'fr' : 'px';
    const start = literal.getStart(sourceFile) + 1;
    recorder.remove(start, literal.getWidth(sourceFile) - 2);
    recorder.insertLeft(start, replacement);
  });
};

const isScaleLiteral = (node: ts.StringLiteral): boolean =>
  node.text === 'auto' || node.text === 'none';

const isScaleCheckerType = (type: ts.Type | undefined, names: Set<string>): boolean => {
  if (!type) {
    return false;
  }

  if (type.isUnionOrIntersection()) {
    return type.types.some(member => isScaleCheckerType(member, names));
  }

  return names.has(type.aliasSymbol?.name ?? '') || names.has(type.symbol?.name ?? '');
};

const getTypedScaleExpression = (
  expression: ts.Expression | undefined,
  scaleMemberNames: Set<string>
): string | undefined => {
  return expression && isTypedScaleExpression(expression, scaleMemberNames)
    ? expression.getText()
    : undefined;
};

const isTypedScaleExpression = (
  expression: ts.Expression,
  scaleMemberNames: Set<string>
): boolean => {
  if (ts.isIdentifier(expression)) {
    return scaleMemberNames.has(expression.text);
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return (
      expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
      scaleMemberNames.has(expression.name.text)
    );
  }

  if (ts.isCallExpression(expression)) {
    return isTypedScaleExpression(expression.expression, scaleMemberNames);
  }

  if (ts.isParenthesizedExpression(expression)) {
    return isTypedScaleExpression(expression.expression, scaleMemberNames);
  }

  return false;
};

const getMappedScaleExpression = (
  expression: string,
  initializer: ts.Expression | undefined
): string | undefined => {
  if (!initializer || !ts.isConditionalExpression(initializer)) {
    return undefined;
  }

  const replacements: { start: number; end: number; value: string }[] = [];
  const source = initializer.getSourceFile();
  const collect = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) && isScaleLiteral(node)) {
      replacements.push({
        start: node.getStart(source) + 1,
        end: node.getEnd() - 1,
        value: node.text === 'none' ? 'px' : 'fr'
      });
      return;
    }

    if (ts.isConditionalExpression(node)) {
      collect(node.whenTrue);
      collect(node.whenFalse);
    }
  };

  collect(initializer);
  if (!replacements.length) {
    return undefined;
  }

  const leadingWhitespaceLength = expression.length - expression.trimStart().length;
  const syntheticSourcePrefixLength = initializer.getStart(source) - leadingWhitespaceLength;
  return replacements
    .sort((first, second) => second.start - first.start)
    .reduce((value, replacement) => {
      return (
        value.slice(0, replacement.start - syntheticSourcePrefixLength) +
        replacement.value +
        value.slice(replacement.end - syntheticSourcePrefixLength)
      );
    }, expression);
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
