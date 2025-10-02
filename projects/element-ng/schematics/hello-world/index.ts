/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { help } from './helper.js';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.logger.info('Hello Word!');
    _context.logger.info('This is a Test.');
    _context.logger.info('Element is currently exploring schematics.');
    help();
    return tree;
  };
}
