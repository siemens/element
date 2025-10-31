/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from '@angular/compiler-cli';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../../utils/index.js';

const buildRelativeFromFile = (relativePath: string): string =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), relativePath);

const collectionPath = buildRelativeFromFile('../../collection.json');

describe('to legacy migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  const name = 'migrate-v47-to-v48';

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const checkTemplateMigration = async (
    fileNames: string[],
    basePath = `/projects/app/src/components/test/`
  ): Promise<void> => {
    addTestFiles(
      appTree,
      Object.fromEntries(
        fileNames.map(fileName => [
          join(basePath, fileName),
          readFileSync(buildRelativeFromFile(join('files', fileName)), 'utf8')
        ])
      )
    );

    addTestFiles(appTree, {
      '/package.json': `{
         "dependencies": {
          "@simpl/element-ng": "47.0.3",
          "@simpl/maps-ng": "47.0.3",
          "@simpl/dashboards-ng": "47.0.3",
          "@simpl/element-translate-ng": "47.0.3",
          "some-other-dep": "1.2.3"
        }
        }`
    });

    const tree = await runner.runSchematic(
      'migrate-v47-to-v48',
      { path: 'projects/app/src' },
      appTree
    );
    for (const fileName of fileNames) {
      const expected = readFileSync(
        buildRelativeFromFile(join('files', 'expected.' + fileName)),
        'utf8'
      );
      const actual = tree.readContent(join(basePath, fileName));
      expect(actual).toEqual(expected);
    }
  };

  it('should migrate si-icon used in a template', async () => {
    await checkTemplateMigration(['icon-template.ts', 'icon-template.html']);
  });

  it('should migrate si-icon used in an inline template', async () => {
    await checkTemplateMigration(['icon-inline-template.ts']);
  });

  it('should migrate si-tab used in a template', async () => {
    await checkTemplateMigration(['tab-template.ts', 'tab-template.html']);
  });

  it('should migrate si-tab used in an inline template', async () => {
    await checkTemplateMigration(['tab-inline-template.ts']);
  });

  it('should migrate siPopover used in a template', async () => {
    await checkTemplateMigration(['popover-template.ts', 'popover-template.html']);
  });

  it('should migrate siPopover used in an inline template', async () => {
    await checkTemplateMigration(['popover-inline-template.ts']);
  });
});
