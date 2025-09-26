/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { discoverSourceFiles, findClassDecorators, findElement, getTemplate } from '../utils';

export const iconMigrationRule = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    const sourceFiles = discoverSourceFiles(tree, context);

    for (const decorator of findClassDecorators(sourceFiles, 'Component', tree)) {
      const template = getTemplate(tree, decorator);
      if (template) {
        const siIconElements = findElement(template.text, n => {
          return n.name === 'si-icon';
        });
        if (siIconElements.length) {
          console.log(siIconElements);
        }
      }
    }
    return chain([...rules]);
  };
};
