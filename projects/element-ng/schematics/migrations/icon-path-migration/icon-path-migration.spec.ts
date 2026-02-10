/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, callRule } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../../utils/index.js';
import { iconPathMigrationRule } from './icon-path-migration.js';

const buildRelativeFromFile = (relativePath: string): string =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), relativePath);

const collectionPath = buildRelativeFromFile('../../collection.json');

describe('icon-path-migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const checkMigration = async (
    fileNames: string[],
    basePath = '/projects/app/src/components/test/'
  ): Promise<void> => {
    addTestFiles(
      appTree,
      Object.fromEntries(
        fileNames.map(fileName => [
          path.join(basePath, fileName),
          readFileSync(buildRelativeFromFile(path.join('files', fileName)), 'utf8')
        ])
      )
    );

    addTestFiles(appTree, {
      '/package.json': `{
         "dependencies": {
          "@siemens/element-ng": "48.10.0",
          "@simpl/element-icons": "1.0.0"
        }
        }`
    });

    const context = runner.engine.createContext(
      runner.engine.createSchematic(
        'migrate-v47-to-v48',
        runner.engine.createCollection(collectionPath)
      )
    );

    const tree = await callRule(
      iconPathMigrationRule({ path: 'projects/app/src' }),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('iconPathMigrationRule returned undefined');
    }

    for (const fileName of fileNames) {
      const expected = readFileSync(
        buildRelativeFromFile(path.join('files', 'expected.' + fileName)),
        'utf8'
      );
      const actual = tree.read(path.join(basePath, fileName))?.toString('utf8');
      expect(actual).toEqual(expected);
    }
  };

  it('should migrate TypeScript imports from @simpl/element-ng/ionic to @siemens/element-icons', async () => {
    await checkMigration(['ionic-import.ts']);
  });

  it('should migrate TypeScript imports from @simpl/element-ng/svg to @siemens/element-icons', async () => {
    await checkMigration(['svg-import.ts']);
  });

  it('should migrate SCSS @use imports from @simpl/element-icons to @siemens/element-icons', async () => {
    await checkMigration(['style-use.scss']);
  });

  it('should migrate SCSS @import statements from @simpl/element-icons to @siemens/element-icons', async () => {
    await checkMigration(['style-import.scss']);
  });

  it('should handle multiple file types in one migration', async () => {
    await checkMigration(['ionic-import.ts', 'svg-import.ts', 'style-use.scss']);
  });

  it('should update package.json to add @siemens/element-icons and remove @simpl/element-icons', async () => {
    addTestFiles(appTree, {
      '/package.json': JSON.stringify({
        dependencies: {
          '@siemens/element-ng': '48.10.0',
          '@simpl/element-icons': '1.0.0'
        }
      })
    });

    const context = runner.engine.createContext(
      runner.engine.createSchematic(
        'migrate-v47-to-v48',
        runner.engine.createCollection(collectionPath)
      )
    );

    const tree = await callRule(
      iconPathMigrationRule({ path: 'projects/app/src' }),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('iconPathMigrationRule returned undefined');
    }

    const packageJsonContent = tree.readText('/package.json');
    const packageJson = JSON.parse(packageJsonContent);

    expect(packageJson.dependencies['@siemens/element-icons']).toBe('^1.0.0');
    expect(packageJson.dependencies['@simpl/element-icons']).toBeUndefined();
    expect(packageJson.dependencies['@siemens/element-ng']).toBe('48.10.0');
  });
});
