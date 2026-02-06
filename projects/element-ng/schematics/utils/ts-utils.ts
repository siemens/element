/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { normalize } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { isAbsolute } from 'path/posix';
import {
  ComponentNamesInstruction,
  PatternReplacementInstruction
} from 'schematics/migrations/data';
import ts from 'typescript';

import { SchematicsFileSystem } from './schematics-file-system.js';

/**
 * Reads and parses a tsconfig file from the given path.
 */
export const parseTsconfigFile = (
  tsconfigPath: string,
  basePath: string,
  tree: Tree
): ts.ParsedCommandLine => {
  // Parse the tsconfig file content
  const fs = new SchematicsFileSystem(tree);
  const { config, error } = ts.readConfigFile(tsconfigPath, fs.readText);
  if (error) {
    throw new SchematicsException(`Error parsing ${tsconfigPath}: ${error.messageText}`);
  }

  // Create a ts.ParseConfigHost that uses the schematics Tree
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: fs.exists,
    readFile: fs.readText,
    readDirectory: (path, _extensions, _excludes, _includes, _depth) => visitDirectory(fs, path),
    useCaseSensitiveFileNames: true
  };

  // Throw if incorrect arguments are passed to this function. Passing relative base paths
  // results in root directories not being resolved and in later type checking runtime errors.
  // More details can be found here: https://github.com/microsoft/TypeScript/issues/37731.
  if (!isAbsolute(basePath)) {
    throw Error('Unexpected relative base path has been specified.');
  }

  return ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, {});
};

/**
 * Finds all nodes which match the given kind.
 */
export const findNodes = <T extends ts.Node>(
  node: ts.Node,
  kindOrGuard: ts.SyntaxKind | ((node: ts.Node) => node is T),
  max = Infinity,
  recursive = false
): T[] => {
  if (!node || max == 0) {
    return [];
  }

  const test =
    typeof kindOrGuard === 'function'
      ? kindOrGuard
      : // eslint-disable-next-line @typescript-eslint/no-shadow
        (node: ts.Node): node is T => node.kind === kindOrGuard;

  const arr: T[] = [];
  if (test(node)) {
    arr.push(node);
    max--;
  }
  if (max > 0 && (recursive || !test(node))) {
    for (const child of node.getChildren()) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func, @typescript-eslint/no-shadow
      findNodes(child, test, max, recursive).forEach(node => {
        if (max > 0) {
          arr.push(node);
        }
        max--;
      });

      if (max <= 0) {
        break;
      }
    }
  }

  return arr;
};

/**
 * Gets the import nodes from a TypeScript file which start the given import path.
 */
export const getImportNodes = (
  filePath: string,
  content: string,
  specifier: string
): ts.ImportDeclaration[] => {
  const sourceFile = ts.createSourceFile(
    filePath,
    content.toString(),
    ts.ScriptTarget.Latest,
    true
  );

  // Find all import declarations in the source file
  const allImports = findNodes(
    sourceFile,
    ts.SyntaxKind.ImportDeclaration
  ) as ts.ImportDeclaration[];

  return allImports.filter(
    node =>
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text.startsWith(specifier)
  );
};

/**
 * Gets the imported symbols from an import declaration.
 */
export const getSymbols = (node: ts.ImportDeclaration): ts.NodeArray<ts.ImportSpecifier> | [] => {
  // Extract all imported component names or module names from @simpl/ imports
  return node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
    ? node.importClause.namedBindings.elements
    : [];
};

const visitDirectory = (fs: SchematicsFileSystem, dirPath: string): string[] => {
  const entries = fs.getDir(dirPath);
  const files: string[] = [];
  entries.subfiles.forEach(filename => {
    if (!filename.startsWith('.')) {
      const fullPath = normalize(`${dirPath}/${filename}`);
      files.push(fullPath);
    }
  });

  entries.subdirs.forEach(subdirname => {
    if (!subdirname.startsWith('.') && subdirname !== 'node_modules') {
      const newFiles = visitDirectory(fs, `${dirPath}/${subdirname}`);
      files.push(...newFiles);
    }
  });

  return files;
};

/** Finds an import specifier with a particular name. */
export const findImportSpecifier = (
  nodes: ts.NodeArray<ts.ImportSpecifier>,
  specifierName: string
): ts.ImportSpecifier | undefined => {
  return nodes.find(element => {
    const { name, propertyName } = element;
    return propertyName ? propertyName.text === specifierName : name.text === specifierName;
  });
};

/**
 * Note: returns only matching imports specifiers,
 * Unmatched imports will be ignored (you won't get undefined), but a shorter array.
 */
export const getImportSpecifiers = (
  sourceFile: ts.SourceFile,
  moduleName: string | RegExp,
  specifierOrSpecifiers: string | string[]
): ts.ImportSpecifier[] => {
  const matches: ts.ImportSpecifier[] = [];
  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      continue;
    }

    const namedBindings = node.importClause?.namedBindings;
    const isMatch =
      typeof moduleName === 'string'
        ? node.moduleSpecifier.text === moduleName
        : moduleName.test(node.moduleSpecifier.text);

    if (!isMatch || !namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    if (typeof specifierOrSpecifiers === 'string') {
      const match = findImportSpecifier(namedBindings.elements, specifierOrSpecifiers);
      if (match) {
        matches.push(match);
      }
    } else {
      for (const specifierName of specifierOrSpecifiers) {
        const match = findImportSpecifier(namedBindings.elements, specifierName);
        if (match) {
          matches.push(match);
        }
      }
    }
  }
  return matches;
};

interface ChangeInstruction {
  start: number;
  width: number;
  newNode: ts.Node;
}

export function* renameIdentifier({
  sourceFile,
  renamingInstructions
}: {
  sourceFile: ts.SourceFile;
  renamingInstructions: ComponentNamesInstruction[];
}): Generator<ChangeInstruction> {
  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      continue;
    }

    for (const renamingInstruction of renamingInstructions) {
      if (!renamingInstruction.module.test(node.moduleSpecifier.text)) {
        continue;
      }

      if (
        !(node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings))
      ) {
        continue;
      }

      // Find all symbols from this import that need to be renamed/moved
      const symbolsToProcess: {
        importSpecifier: ts.ImportSpecifier;
        replace: string;
        replaceWith: string;
      }[] = [];

      for (const { replace, replaceWith } of renamingInstruction.symbolRenamings) {
        const importSpecifier = findImportSpecifier(
          node.importClause.namedBindings.elements,
          replace
        );

        if (importSpecifier) {
          symbolsToProcess.push({ importSpecifier, replace, replaceWith });
        }
      }

      if (symbolsToProcess.length === 0) {
        continue;
      }

      const hasMultipleImports = node.importClause.namedBindings.elements.length > 1;
      const allSymbolsBeingMigrated = symbolsToProcess.map(s => s.replace);
      const otherImportsNotBeingMigrated = node.importClause.namedBindings.elements.filter(
        el => !allSymbolsBeingMigrated.includes(el.name.text)
      );

      if (
        renamingInstruction.toModule &&
        hasMultipleImports &&
        otherImportsNotBeingMigrated.length > 0 &&
        !node.moduleSpecifier.text.endsWith('@simpl/element-ng')
      ) {
        // Split the import: keep non-migrated symbols in original import, move migrated symbols to new import

        // Replace the entire import with remaining imports
        const newImportClause = ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports(
            otherImportsNotBeingMigrated.map(el =>
              ts.factory.createImportSpecifier(false, el.propertyName, el.name)
            )
          )
        );

        const updatedImport = ts.factory.createImportDeclaration(
          undefined,
          newImportClause,
          node.moduleSpecifier
        );

        yield {
          start: node.getStart(),
          width: node.getWidth(),
          newNode: updatedImport
        };

        // Create new import with all migrated symbols (with their new names)
        const newImport = ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports(
              symbolsToProcess.map(({ replaceWith }) =>
                ts.factory.createImportSpecifier(
                  false,
                  undefined,
                  ts.factory.createIdentifier(replaceWith)
                )
              )
            )
          ),
          ts.factory.createStringLiteral(renamingInstruction.toModule, true)
        );

        yield {
          start: node.getEnd(),
          width: 0,
          newNode: ts.factory.createIdentifier(
            '\n' + ts.createPrinter().printNode(ts.EmitHint.Unspecified, newImport, sourceFile)
          )
        };
      } else if (
        renamingInstruction.toModule &&
        !node.moduleSpecifier.text.endsWith('@simpl/element-ng')
      ) {
        // All symbols in this import are being migrated, so update the module path and rename symbols
        for (const { importSpecifier, replaceWith } of symbolsToProcess) {
          yield {
            start: importSpecifier.name.getStart(),
            width: importSpecifier.name.getWidth(),
            newNode: ts.factory.createIdentifier(replaceWith)
          };
        }

        const newPath = node.moduleSpecifier.text.replace(
          renamingInstruction.module,
          renamingInstruction.toModule
        );

        yield {
          start: node.moduleSpecifier.getStart(),
          width: node.moduleSpecifier.getWidth(),
          newNode: ts.factory.createStringLiteral(newPath, true)
        };
      } else {
        // No module move, just rename the symbols in place
        for (const { importSpecifier, replaceWith } of symbolsToProcess) {
          yield {
            start: importSpecifier.name.getStart(),
            width: importSpecifier.name.getWidth(),
            newNode: ts.factory.createIdentifier(replaceWith)
          };
        }
      }

      // Create a visitor to rename all occurrences of the symbols in the file
      for (const { replace, replaceWith } of symbolsToProcess) {
        const visitor = function* (visitedNode: ts.Node): Generator<ChangeInstruction> {
          if (ts.isIdentifier(visitedNode) && visitedNode.text === replace) {
            yield {
              start: visitedNode.getStart(),
              width: visitedNode.getWidth(),
              newNode: ts.factory.createIdentifier(replaceWith)
            };
          } else {
            for (const child of visitedNode.getChildren()) {
              yield* visitor(child);
            }
          }
        };

        for (const statement of sourceFile.statements) {
          if (!ts.isImportDeclaration(statement)) {
            yield* visitor(statement);
          }
        }
      }
    }
  }
}

export const patternReplacements = ({
  tree,
  filePath,
  sourceFile,
  replacements
}: {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  replacements: PatternReplacementInstruction[];
}): void => {
  for (const patternInstruction of replacements) {
    // Check if this file imports from the relevant module
    const relevantImport = sourceFile.statements.find(
      stmt =>
        ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        patternInstruction.module.test(stmt.moduleSpecifier.text)
    ) as ts.ImportDeclaration | undefined;

    if (!relevantImport) {
      continue;
    }

    if (patternInstruction.requiresSymbols && patternInstruction.requiresSymbols.length > 0) {
      const importedSymbols = getSymbols(relevantImport);
      const hasRequiredSymbol = patternInstruction.requiresSymbols.some(requiredSymbol =>
        importedSymbols.some(
          specifier =>
            specifier.name.text === requiredSymbol ||
            specifier.propertyName?.text === requiredSymbol
        )
      );

      if (!hasRequiredSymbol) {
        continue;
      }
    }

    const fileContent = tree.read(filePath)?.toString() ?? '';
    let hasChanges = false;

    for (const { pattern } of patternInstruction.patterns) {
      if (pattern.test(fileContent)) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      let updatedContent = fileContent;

      for (const { pattern, replacement } of patternInstruction.patterns) {
        updatedContent = updatedContent.replace(pattern, replacement);
      }

      const patternRecorder = tree.beginUpdate(filePath);
      patternRecorder.remove(0, fileContent.length);
      patternRecorder.insertLeft(0, updatedContent);
      tree.commitUpdate(patternRecorder);
    }
  }
};

export interface VisitFunctionCallOptions {
  sourceFile: ts.SourceFile;
  moduleSpecifier: string | RegExp;
  className?: string;
  functionName: string;
  visitor: (node: ts.CallExpression) => void;
}

/**
 * Visits all function static call nodes that match the given module, class, and function names.
 * This function handles nested calls, so it will find `ClassName.method()`.
 * If className is not provided, it will search for standalone function calls (e.g., `functionName()`).
 */
export const visitStaticFunctionCalls = ({
  sourceFile,
  moduleSpecifier,
  className,
  functionName,
  visitor
}: VisitFunctionCallOptions): void => {
  // Get all import specifiers from the module
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const importSpecifierName = className || functionName;
  const allImportSpecifiers = getImportSpecifiers(sourceFile, moduleSpecifier, importSpecifierName);
  if (allImportSpecifiers.length === 0) {
    return;
  }

  // Get the local names (including aliases) for the imported class or function
  const localNames = allImportSpecifiers.map(spec => spec.name.text);

  // Recursive visitor function that traverses all nodes including nested function call arguments
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (className) {
        // Handle PropertyAccessExpression (e.g. Class.method())
        if (ts.isPropertyAccessExpression(expression)) {
          const propertyName = expression.name.text;

          // Check if the method name matches
          if (propertyName === functionName) {
            const objectExpression = expression.expression;
            // Case 1: Static call - ClassName.method()
            if (ts.isIdentifier(objectExpression)) {
              if (localNames.includes(objectExpression.text)) {
                visitor(node);
              }
            }
          }
        }
      } else {
        // Handle standalone function calls (e.g., functionName())
        if (ts.isIdentifier(expression)) {
          if (localNames.includes(expression.text)) {
            visitor(node);
          }
        }
      }
    }

    // Recursively visit all children
    ts.forEachChild(node, visit);
  };

  // Start visiting from the source file
  ts.forEachChild(sourceFile, visit);
};

/**
 * Calculates distance between two strings.
 * Lower number = closer match.
 */
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Find closest import statement.
 *
 * Note: the function assumes that there is at least one import in the file.
 */
const findClosestImport = (
  search: string,
  imports: ts.ImportDeclaration[]
): ts.ImportDeclaration => {
  return imports.reduce((closest, current) => {
    const currentModule = (current.moduleSpecifier as ts.StringLiteral).text;
    const closestModule = (closest.moduleSpecifier as ts.StringLiteral).text;
    const currentDist = getLevenshteinDistance(search, currentModule);
    const closestDist = getLevenshteinDistance(search, closestModule);
    return currentDist < closestDist ? current : closest;
  });
};

/** Ensures that a specific identifier is imported from the given module */
export const applyImport = (
  sourceFile: ts.SourceFile,
  identifierName: string,
  moduleSpecifier: string
): { start: number; end: number; replacement: string } | null => {
  const imports = sourceFile.statements
    .filter(ts.isImportDeclaration)
    // Filter only external module imports
    .filter(
      i =>
        i.moduleSpecifier &&
        ts.isStringLiteral(i.moduleSpecifier) &&
        !i.moduleSpecifier.text.startsWith('.')
    );
  const closestImport = findClosestImport(moduleSpecifier, imports);

  // Check if the module is already imported
  if ((closestImport.moduleSpecifier as ts.StringLiteral).text === moduleSpecifier) {
    const namedBindings = closestImport.importClause?.namedBindings;

    if (namedBindings && ts.isNamedImports(namedBindings)) {
      // Check if the identifier already exists
      const hasIdentifier = namedBindings.elements.some(el => el.name.text === identifierName);
      if (hasIdentifier) {
        // Already imported, no transformation needed
        return null;
      }

      // Add at the end
      const elements = Array.from(namedBindings.elements);
      const lastElement = elements.at(-1);
      if (lastElement) {
        return {
          start: lastElement.getEnd(),
          end: lastElement.getEnd(),
          replacement: `, ${identifierName}`
        };
      }
    }
  }

  const newImport = `import { ${identifierName} } from '${moduleSpecifier}';`;
  const fullText = sourceFile.getFullText();
  const end = closestImport.getEnd();

  // Find the position after the trailing newline(s) of the closest import
  let insertPosition = end;
  if (fullText[insertPosition] === '\r') insertPosition++;
  if (fullText[insertPosition] === '\n') insertPosition++;

  return {
    start: insertPosition,
    end: insertPosition,
    replacement: `${newImport}\n`
  };
};
