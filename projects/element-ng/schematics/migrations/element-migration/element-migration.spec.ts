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
import { getElementMigrationTestData } from '../data/migration-test-data.js';
import { elementMigrationRule } from './element-migration.js';

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
          path.join(basePath, fileName),
          readFileSync(buildRelativeFromFile(path.join('files', fileName)), 'utf8')
        ])
      )
    );

    addTestFiles(appTree, {
      '/package.json': `{
         "dependencies": {
          "@simpl/element-ng": "48.10.0",
          "@simpl/maps-ng": "48.10.0",
          "@simpl/dashboards-ng": "48.10.0",
          "@simpl/element-translate-ng": "48.10.0",
          "some-other-dep": "1.2.3"
        }
        }`
    });

    const migrationData = getElementMigrationTestData();
    const context = runner.engine.createContext(
      runner.engine.createSchematic(
        'migrate-v47-to-v48',
        runner.engine.createCollection(collectionPath)
      )
    );

    // Run elementMigrationRule directly with test data
    const tree = await callRule(
      elementMigrationRule({ path: 'projects/app/src' }, migrationData),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('elementMigrationRule returned undefined');
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

  it('should remove the deprecated api from accordion', async () => {
    await checkTemplateMigration(['accordion-inline-template.ts']);
  });

  it('should remove the deprecated api from SiDateRangeComponent', async () => {
    await checkTemplateMigration(['date-range-inline-template.ts']);
  });

  it('should remove the deprecated api from SiDateInputDirective', async () => {
    await checkTemplateMigration(['date-input-directive-inline-template.ts']);
  });

  it('should remove the deprecated api from SiDatepickerDirective', async () => {
    await checkTemplateMigration(['date-picker-inline-template.ts']);
  });

  it('should remove the deprecated api from SiFilteredSearchComponent', async () => {
    await checkTemplateMigration(['filtered-search-inline-template.ts']);
  });

  it('should remove the deprecated api from SiFormItemComponent', async () => {
    await checkTemplateMigration(['form-item-inline-template.ts']);
  });

  it('should remove the deprecated api from SiNavbarVerticalComponent', async () => {
    await checkTemplateMigration(['navbar-vertical-inline.template.ts']);
  });

  it('should remove the deprecated api from SiSplitPartComponent', async () => {
    await checkTemplateMigration(['split-inline.template.ts']);
  });

  it('should remove the deprecated api from SiTreeViewComponent', async () => {
    await checkTemplateMigration(['tree-inline.template.ts']);
  });

  it('should remove the deprecated api from module based accordion', async () => {
    await checkTemplateMigration(['module-based.accordion-inline-template.ts']);
  });

  it('should rename functions of classes', async () => {
    await checkTemplateMigration(['function-rename.ts']);
  });
});
