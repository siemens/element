/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { addTestFiles, createTestApp } from '../utils';

const migrationPath = path.join(
  process.cwd(),
  'dist/@siemens/element-ng/schematics/migration.json'
);

describe('ng-update migration version 48.0.0', () => {
  const name = 'migrations';
  const sourceFile = '/projects/app/src/app/fake-1.ts';

  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, migrationPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  describe('si-icon migration', () => {
    test.only('should migrate to v48', async () => {
      addTestFiles(appTree, {
        [sourceFile]: [
          `import { Component } from '@angular/core';`,
          `@Component({ template: \`<si-icon icon="element-icon"></si-icon>\` })`,
          `export class Test {}`
        ].join('\n')
      });
      const tree = await runner.runSchematic(
        'migration-v48',
        { path: 'projects/app/src' },
        appTree
      );
      expect(tree).toBeDefined();
    });
  });
});
