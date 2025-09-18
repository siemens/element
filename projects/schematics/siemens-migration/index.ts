/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { dirname, isAbsolute, resolve } from 'path';
import * as ts from 'typescript';

import {
  getTsConfigPaths,
  getImportNodes,
  getSymbols,
  createFullPathTree,
  parseTsconfigFile,
  getGlobalStyles
} from '../utils';
import { findComponentImportPath } from './mappings';
import { MigrationOptions, Migrations } from './model';

const styleReplacements = [
  {
    replace: `@import '@simpl/element-theme/`,
    new: `@import '@siemens/element-theme/`
  },
  {
    replace: `@use '@simpl/element-theme/`,
    new: `@use '@siemens/element-theme/`
  }
];

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export const siemensMigration = (_options: MigrationOptions): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Starting Simpl to Siemens migration...');

    const sourceFiles = discoverSourceFiles(tree, context, _options);
    const rules: Rule[] = [];

    for (const filePath of sourceFiles) {
      const migrations = collectMigrationImports(filePath, tree, context);
      const { imports, toRemoveImports } = migrations;

      if (imports.size === 0 && toRemoveImports.length === 0) {
        continue;
      }

      const rule = rewriteImportsInFile(filePath, migrations);
      rules.push(rule);
    }

    const globalStyles = getGlobalStyles(tree);
    for (const style of globalStyles) {
      if (style.endsWith('.scss') || style.endsWith('.sass')) {
        const content = tree.readText(style);
        for (const pattern of [
          /@use '@simpl\/element-theme\/src\/theme' with \(([\s\S]*?)\);/g,
          /@use '@simpl\/element-ng\/simpl-element-ng' with \(([\s\S]*?)\);/g,
          /@use '@simpl\/element-theme\/src\/theme';/g
        ]) {
          const match = pattern.exec(content);
          if (match) {
            rules.push(migrateScssImports(style, [{ replace: match[0], new: '' }]));
          }
        }

        // Apply theme styles if not already present
        const themeStyles = [
          { insert: `@use '@simpl/brand/assets/fonts/styles/siemens-sans';` },
          {
            insert: `@use '@siemens/element-theme/src/theme' with (
  $element-theme-default: 'siemens-brand',
  $element-themes: (
    'siemens-brand',
    'element'
  )
);`,
            pattern: /@use '@siemens\/element-theme\/src\/theme' with \(([\s\S]*?)\);/g
          },
          { insert: `@use '@siemens/element-ng/element-ng';` },
          { insert: `@use '@siemens/element-theme/src/styles/themes';` },
          { insert: `@use '@simpl/brand/dist/element-theme-siemens-brand-light' as brand-light;` },
          { insert: `@use '@simpl/brand/dist/element-theme-siemens-brand-dark' as brand-dark;` },
          {
            insert: `@include themes.make-theme(brand-light.$tokens, 'siemens-brand');`,
            pattern: /@include themes\.make-theme\(brand-light\.\$tokens, 'siemens-brand'\);/g
          },
          {
            insert: `@include themes.make-theme(brand-dark.$tokens, 'siemens-brand', true);`,
            pattern: /@include themes\.make-theme\(brand-dark\.\$tokens, 'siemens-brand', true\);/g
          }
        ];
        let predecessor = '';
        for (const themeEntry of themeStyles) {
          const match = content.match(themeEntry.pattern ?? themeEntry.insert);
          if (match) {
            predecessor = match[0];
            continue;
          }

          rules.push(applyGlobalStyles(style, predecessor, themeEntry.insert + '\n'));
          predecessor = themeEntry.insert;
        }
      }
    }

    const scssFiles = discoverSourceFiles(tree, context, _options, '.scss');
    for (const filePath of scssFiles) {
      const content = tree.readText(filePath);
      if (
        content.includes(styleReplacements[0].replace) ||
        content.includes(styleReplacements[1].replace)
      ) {
        rules.push(migrateScssImports(filePath));
      }
    }

    const chainedRules = chain([...rules]);
    context.logger.info('✅ Simpl to Siemens migration completed!');
    return chainedRules(tree, context);
  };
};

const collectMigrationImports = (
  filePath: string,
  tree: Tree,
  _context: SchematicContext
): Migrations => {
  const content = tree.read(filePath);
  const imports = new Map<string, string[]>();

  if (!content) {
    return { imports, toRemoveImports: [] };
  }

  const simplImports = getImportNodes(filePath, content.toString(), '@simpl/');
  const toRemoveImports: ts.ImportDeclaration[] = [];

  for (const node of simplImports) {
    const symbols = getSymbols(node);
    const importPath = node.moduleSpecifier.getText().replace(/['"]/g, '');
    let toRemove = false;
    for (const symbol of symbols) {
      const symbolName = symbol.name.getText();
      const newImportPath = findComponentImportPath(symbolName, importPath);
      if (!newImportPath) {
        continue;
      }

      toRemove = true;
      const migration = imports.get(newImportPath);
      if (!migration) {
        imports.set(newImportPath, [symbolName]);
      } else {
        migration.push(symbolName);
      }
    }

    if (toRemove) {
      toRemoveImports.push(node);
    }
  }

  return { imports, toRemoveImports };
};

const rewriteImportsInFile = (filePath: string, migrations: Migrations): Rule => {
  return (tree: Tree): Tree => {
    const recorder = tree.beginUpdate(filePath);
    const start = migrations.toRemoveImports.at(0)?.getFullStart() ?? 0;

    // Remove old imports
    for (const importDecl of migrations.toRemoveImports) {
      recorder.remove(importDecl.getFullStart(), importDecl.getFullWidth());
    }

    // Add new imports
    const importPaths = Array.from(migrations.imports.keys()).sort((a, b) => a.localeCompare(b));

    for (const path of importPaths) {
      const symbols = migrations.imports.get(path)!;
      recorder.insertLeft(
        start,
        `\nimport { ${symbols.sort((a, b) => a.localeCompare(b)).join(', ')} } from '${path}';`
      );
    }

    tree.commitUpdate(recorder);
    return tree;
  };
};

const discoverSourceFiles = (
  tree: Tree,
  context: SchematicContext,
  options: MigrationOptions,
  extension: string = '.ts'
): string[] => {
  const basePath = process.cwd().replace(/\\/g, '/');

  // Wrap the tree to force full paths since parsing the typescript config requires full paths.
  const tsTree = createFullPathTree(basePath, tree);
  const tsConfigs = getTsConfigPaths(tree);

  if (!tsConfigs.length) {
    throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
  }

  context.logger.debug(`Found tsconfig files: ${tsConfigs.join(', ')}`);
  let sourceFiles: string[] = [];
  for (const configPath of tsConfigs) {
    const tsConfigPath = resolve(basePath, configPath);
    const config = parseTsconfigFile(tsConfigPath, dirname(tsConfigPath), tsTree);
    sourceFiles.push(...config.fileNames.filter(f => f.endsWith(extension)));
  }

  // Filter all files which are in the path
  if (options.path) {
    sourceFiles = isAbsolute(options.path)
      ? sourceFiles.filter(f => f.startsWith(options.path))
      : sourceFiles.filter(f => f.startsWith(resolve(basePath, options.path)));
  }

  return Array.from(new Set(sourceFiles)).map(path => path.substring(basePath.length + 1));
};

const migrateScssImports = (
  filePath: string,
  replacements: { replace: string; new: string }[] = styleReplacements
): Rule => {
  return (tree: Tree): Tree => {
    const recorder = tree.beginUpdate(filePath);
    const content = tree.readText(filePath);
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      hasMore = false;
      for (const replacement of replacements) {
        const start = content.indexOf(replacement.replace, offset);
        if (start >= 0) {
          recorder.remove(start, replacement.replace.length);
          recorder.insertLeft(start, replacement.new);
          const size = replacement.new.length === 0 ? 1 : replacement.new.length;
          offset = start + size;
          hasMore = true;
        }
      }
    }
    tree.commitUpdate(recorder);
    return tree;
  };
};

const applyGlobalStyles = (filePath: string, anchor: string, insert: string): Rule => {
  return (tree: Tree): Tree => {
    const recorder = tree.beginUpdate(filePath);
    const content = tree.readText(filePath);
    let pos = content.indexOf(anchor) + anchor.length;
    if (pos > 0) {
      // If the insert position is not the file start we want to insert the next line after the new line
      pos = content.indexOf('\n', pos) + 1;
    }
    recorder.insertRight(pos, insert);
    tree.commitUpdate(recorder);
    return tree;
  };
};
