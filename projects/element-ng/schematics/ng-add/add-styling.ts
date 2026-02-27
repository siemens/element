/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { updateWorkspace } from '@schematics/angular/utility/workspace';

import { getGlobalStyles } from '../utils/index.js';

export const ngAddSetupElementStyles = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🎨 Configuring Element styles...');
    return addElementStyle()(tree, context);
  };
};

const addElementStyle = (): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    const globalStyles = await getGlobalStyles(tree);
    for (const style of globalStyles) {
      if (style.endsWith('.scss') || style.endsWith('.sass')) {
        const content = tree.readText(style);

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

    rules.push(addStylesToAngularJson());
    return chain([...rules]);
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

/**
 * Adds Element styles configuration to angular.json
 */
const addStylesToAngularJson = (): Rule => {
  return updateWorkspace(workspace => {
    for (const [, project] of workspace.projects) {
      for (const [targetName, target] of project.targets) {
        if (!['build', 'test'].includes(targetName)) {
          continue;
        }

        // Add node_modules to stylePreprocessorOptions
        if (target.options) {
          const preprocessorOptions = target.options.stylePreprocessorOptions as
            | {
                includePaths?: string[];
              }
            | undefined;

          if (!preprocessorOptions) {
            target.options.stylePreprocessorOptions = {
              includePaths: ['node_modules/']
            };
          } else if (!preprocessorOptions.includePaths) {
            preprocessorOptions.includePaths = ['node_modules/'];
          } else if (!preprocessorOptions.includePaths.includes('node_modules/')) {
            preprocessorOptions.includePaths.push('node_modules/');
          }
        }
      }
    }
  });
};

// Apply theme styles if not already present
const THEME_STYLE_ENTRIES = [
  { insert: `// Load Siemens fonts` },
  { insert: `@use '@simpl/brand/assets/fonts/styles/siemens-sans';` },
  { insert: `// Load Element icons` },
  { insert: `@use '@siemens/element-icons/dist/style/siemens-element-icons';` },
  { insert: `// Use Element theme` },
  {
    insert: `@use '@siemens/element-theme/src/theme' with (
  $element-theme-default: 'siemens-brand',
  $element-themes: (
    'siemens-brand',
    'element'
  )
);`,
    pattern: /@use ['"]@siemens\/element-theme\/src\/theme['"] with \(([\s\S]*?)\);/g
  },
  { insert: `// Use Element components` },
  { insert: `@use '@siemens/element-ng/element-ng';` },
  { insert: `// Build the siemens-brand theme` },
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
