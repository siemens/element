/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
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
          path.join(basePath, fileName),
          readFileSync(buildRelativeFromFile(path.join('files', fileName)), 'utf8')
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
        buildRelativeFromFile(path.join('files', 'expected.' + fileName)),
        'utf8'
      );
      const actual = tree.readContent(path.join(basePath, fileName));
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
});

describe('v48 to v49 migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  const name = 'migrate-v48-to-v49';
  const migrationCollectionPath = buildRelativeFromFile('../../migration.json');

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, migrationCollectionPath);
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
          "@siemens/element-ng": "48.0.0",
          "@siemens/maps-ng": "48.0.0",
          "@siemens/dashboards-ng": "48.0.0",
          "@siemens/charts-ng": "48.0.0"
        }
        }`
    });

    const tree = await runner.runSchematic('migration-v49', { path: 'projects/app/src' }, appTree);
    for (const fileName of fileNames) {
      const expected = readFileSync(
        buildRelativeFromFile(path.join('files', 'expected.' + fileName)),
        'utf8'
      );
      const actual = tree.readContent(path.join(basePath, fileName));
      expect(actual).toEqual(expected);
    }
  };

  it('should migrate ToastStateName to StatusType', async () => {
    await checkTemplateMigration(['toast-state-name.ts']);
  });

  it('should migrate filtered search readonly attribute in inline templates', async () => {
    await checkTemplateMigration(['filtered-search-inline-readonly.ts']);
  });

  it('should migrate Criterion types to CriterionValue and CriterionDefinition', async () => {
    await checkTemplateMigration(['filtered-search-criterion-types.ts']);
  });

  it('should migrate select dropdownClose output in inline templates', async () => {
    await checkTemplateMigration(['select-dropdown-inline.ts']);
  });

  it('should migrate unauthorized page component in inline templates', async () => {
    await checkTemplateMigration(['unauthorized-page-inline.ts']);
  });

  it('should migrate CONFIG_TOKEN to SI_DASHBOARD_CONFIGURATION in inline usage', async () => {
    await checkTemplateMigration(['dashboard-config-inline.ts']);
  });

  it('should migrate modal initialState to inputValues', async () => {
    await checkTemplateMigration(['modal-initial-state.ts']);
  });

  it('should remove onResize method calls and output from si-map', async () => {
    await checkTemplateMigration(['map-onresize.ts']);
  });

  it('should split numberOfDecimals into minNumberOfDecimals and maxNumberOfDecimals', async () => {
    await checkTemplateMigration(['chart-gauge-decimals.ts']);
  });

  it('should migrate resize observer properties to signal calls', async () => {
    await checkTemplateMigration(['resize-observer.ts']);
  });
});
