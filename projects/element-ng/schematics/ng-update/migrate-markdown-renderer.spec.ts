/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Tree, callRule } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';
import { markdownRendererMigrationRule } from './migrate-markdown-renderer.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');
const migrationFixturePath = (...fileNames: string[]): string =>
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../migrations/element-migration/files',
    ...fileNames
  );
const readMigrationFixture = (fileName: string): string =>
  readFileSync(migrationFixturePath(fileName), 'utf8');

describe('markdown renderer migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('migration-v51', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const runMigration = async (): Promise<Tree> => {
    const context = runner.engine.createContext(
      runner.engine.createSchematic('migration-v51', runner.engine.createCollection(collectionPath))
    );
    const tree = await callRule(
      markdownRendererMigrationRule({ path: 'projects/app/src' }),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('markdownRendererMigrationRule returned undefined');
    }

    return tree;
  };

  it('should replace si-markdown-renderer with si-markdown in an inline template', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': readMigrationFixture('markdown-renderer-inline.ts')
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.ts')).toBe(
      readMigrationFixture('expected.markdown-renderer-inline.ts')
    );
  });

  it('should replace si-markdown-renderer with si-markdown in an external template', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': readMigrationFixture('markdown-renderer-template.ts'),
      '/projects/app/src/test.component.html': readMigrationFixture(
        'markdown-renderer-template.html'
      )
    });

    const tree = await runMigration();

    expect(tree.readContent('/projects/app/src/test.component.ts')).toBe(
      readMigrationFixture('expected.markdown-renderer-template.ts')
    );
    expect(tree.readContent('/projects/app/src/test.component.html')).toBe(
      readMigrationFixture('expected.markdown-renderer-template.html')
    );
  });
});
