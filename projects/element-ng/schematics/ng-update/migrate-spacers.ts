/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Rule, Tree } from '@angular-devkit/schematics';

const SOURCE_EXTENSIONS = ['.css', '.html', '.less', '.sass', '.scss', '.ts'];
const SPACER_REPLACEMENTS: Record<string, string> = {
  '10': '13',
  '11': '14'
};

export const spacerMigrationRule = (options: { path: string }): Rule => {
  return (tree: Tree) => {
    const normalizedProjectPath = `/${options.path.replace(/^\/+|\/+$/g, '')}`;

    tree.visit(filePath => {
      if (
        !isWithinProject(filePath, normalizedProjectPath) ||
        filePath.includes('/node_modules/') ||
        !SOURCE_EXTENSIONS.some(extension => filePath.endsWith(extension))
      ) {
        return;
      }

      const content = tree.readText(filePath);
      const updatedContent = replaceSpacers(content);
      if (updatedContent !== content) {
        tree.overwrite(filePath, updatedContent);
      }
    });

    return tree;
  };
};

const isWithinProject = (filePath: string, projectPath: string): boolean =>
  projectPath === '/' || filePath === projectPath || filePath.startsWith(`${projectPath}/`);

const replaceSpacers = (content: string): string => {
  const withUpdatedHelpers = content.replace(
    /(?<![\w-])([mp](?:[tbsexy])?-(?:(?:sm|md|lg|xl|xxl)-)?n?)(10|11)\b/g,
    (_match, prefix: string, spacer: string) => `${prefix}${SPACER_REPLACEMENTS[spacer]}`
  );

  return withUpdatedHelpers.replace(
    /((?:map\.(?:get|has-key)|map-get)\(\s*[^,)]*\$spacers(?:-(?:inline|block))?\s*,\s*)(10|11)(?=\s*\))/g,
    (_match, prefix: string, spacer: string) => `${prefix}${SPACER_REPLACEMENTS[spacer]}`
  );
};
