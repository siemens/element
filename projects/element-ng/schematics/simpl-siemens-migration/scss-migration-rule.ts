/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { getGlobalStyles, discoverSourceFiles } from '../utils';
import { SCSS_USE_PATTERNS, STYLE_REPLACEMENTS, THEME_STYLE_ENTRIES } from './mappings';

/**
 * Creates a schematic rule for migrating SCSS files in a Siemens migration context.
 *
 * This rule performs the following migration tasks:
 * - Processes global styles files (`.scss` and `.sass`) and removes specific SCSS use patterns
 * - Applies theme style entries to global styles based on predefined patterns
 * - Discovers and migrates SCSS source files that contain specific style replacements
 *
 * @param _options - Migration options configuration (currently unused)
 * @returns A schematic rule function that processes the file tree and applies SCSS migrations
 *
 * @example
 * ```typescript
 * const rule = scssMigrationRule({ path: 'some-path' });
 * // Use with Angular Schematics
 * ```
 */
export const scssMigrationRule = (_options: { path: string }): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    context.logger.info('🎨 Migrating SCSS styles...');
    const globalStyles = getGlobalStyles(tree);
    for (const style of globalStyles) {
      if (style.endsWith('.scss') || style.endsWith('.sass')) {
        const content = tree.readText(style);

        for (const pattern of SCSS_USE_PATTERNS) {
          const match = pattern.exec(content);
          if (match) {
            rules.push(migrateScssImports(style, [{ replace: match[0], new: '' }]));
          }
        }

        let predecessor = '';
        for (const themeEntry of THEME_STYLE_ENTRIES) {
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

    const scssFiles = discoverSourceFiles(tree, context, _options.path, '.scss');
    for (const filePath of scssFiles) {
      const content = tree.readText(filePath);
      if (
        content.includes(STYLE_REPLACEMENTS[0].replace) ||
        content.includes(STYLE_REPLACEMENTS[1].replace)
      ) {
        rules.push(migrateScssImports(filePath));
      }
    }

    return chain([...rules]);
  };
};

const migrateScssImports = (
  filePath: string,
  replacements: { replace: string; new: string }[] = STYLE_REPLACEMENTS
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
