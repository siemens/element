/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Tree, callRule } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, getElementMigrationTestData, createTestApp } from '../../testing/index.js';
import { getElementMigrationData } from '../data/element-migration-data.js';
import { elementMigrationRule } from './element-migration.js';

const buildRelativeFromFile = (relativePath: string): string =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), relativePath);

const collectionPath = buildRelativeFromFile('../../migration.json');

interface MigrationCase {
  name: string;
  files: string[];
}

const migrationCases: MigrationCase[] = [
  {
    name: 'migrates si-icon used in a template',
    files: ['icon-template.ts', 'icon-template.html']
  },
  { name: 'migrates si-icon used in an inline template', files: ['icon-inline-template.ts'] },
  { name: 'migrates si-tab used in a template', files: ['tab-template.ts', 'tab-template.html'] },
  { name: 'migrates si-tab used in an inline template', files: ['tab-inline-template.ts'] },
  {
    name: 'migrates siPopover used in a template',
    files: ['popover-template.ts', 'popover-template.html']
  },
  { name: 'migrates siPopover used in an inline template', files: ['popover-inline-template.ts'] },
  { name: 'removes the deprecated api from accordion', files: ['accordion-inline-template.ts'] },
  {
    name: 'removes the deprecated api from SiDateRangeComponent',
    files: ['date-range-inline-template.ts']
  },
  {
    name: 'removes the deprecated api from SiDateInputDirective',
    files: ['date-input-directive-inline-template.ts']
  },
  {
    name: 'removes the deprecated api from SiDatepickerDirective',
    files: ['date-picker-inline-template.ts']
  },
  {
    name: 'removes the deprecated api from SiFilteredSearchComponent',
    files: ['filtered-search-inline-template.ts']
  },
  {
    name: 'removes the deprecated api from SiFormItemComponent',
    files: ['form-item-inline-template.ts']
  },
  {
    name: 'removes the deprecated api from SiNavbarVerticalComponent',
    files: ['navbar-vertical-inline.template.ts']
  },
  {
    name: 'removes the deprecated api from SiSplitPartComponent',
    files: ['split-inline.template.ts']
  },
  {
    name: 'removes the deprecated api from SiTreeViewComponent',
    files: ['tree-inline.template.ts']
  },
  {
    name: 'removes the deprecated api from module based accordion',
    files: ['module-based.accordion-inline-template.ts']
  },
  { name: 'migrates ToastStateName to StatusType', files: ['toast-state-name.ts'] },
  {
    name: 'migrates filtered search readonly attribute in inline templates',
    files: ['filtered-search-inline-readonly.ts']
  },
  {
    name: 'migrates unauthorized page component in inline templates',
    files: ['unauthorized-page-inline.ts']
  },
  {
    name: 'splits numberOfDecimals into minNumberOfDecimals and maxNumberOfDecimals',
    files: ['chart-gauge-decimals.ts']
  },
  { name: 'moves map moreText to the map tooltip', files: ['map-tooltip-inline-template.ts'] },
  { name: 'renames functions of classes', files: ['function-rename.ts'] },
  { name: 'renames modal initialState to inputValues', files: ['modal-rename.ts'] },
  {
    name: 'migrates element classes in inline template',
    files: ['element-class-inline-template.ts']
  },
  {
    name: 'adds button classes to si-select without form-control',
    files: ['select-class-inline-template.ts']
  },
  {
    name: 'renames CSS custom properties in all supported usages',
    files: [
      'feedback-icon-property.ts',
      'feedback-icon-property.html',
      'feedback-icon-property.scss'
    ]
  },
  {
    name: 'renames direct and module-prefixed typography variables',
    files: ['typography-variables.scss']
  },
  {
    name: 'removes provideIconConfig from a providers array and drops its import',
    files: ['provide-icon-config.ts']
  },
  {
    name: 'removes provideIconConfig when it is the sole provider',
    files: ['provide-icon-config-sole-provider.ts']
  },
  {
    name: 'removes provideIconConfig but keeps other symbols from the same import',
    files: ['provide-icon-config-mixed-import.ts']
  }
];

const productionDataCases: MigrationCase[] = [
  { name: 'preserves background classes on badges', files: ['badge-class-inline-template.ts'] },
  {
    name: 'migrates header logo imports and inline templates',
    files: ['header-logo-inline-template.ts']
  },
  {
    name: 'migrates header logo imports and external templates',
    files: ['header-logo-template.ts', 'header-logo-template.html']
  },
  { name: 'preserves header logo import aliases', files: ['header-logo-alias.ts'] },
  {
    name: 'reuses an existing header logo directive import',
    files: ['header-logo-existing-import.ts', 'header-logo-separate-import.ts']
  }
];

const basePath = '/projects/app/src/components/test/';

describe('to legacy migration', () => {
  let migratedTree: Tree;
  let productionDataTree: Tree;

  const runCases = async (
    cases: MigrationCase[],
    migrationData = getElementMigrationTestData()
  ): Promise<Tree> => {
    const runner = new SchematicTestRunner('migration-v51', collectionPath);
    const appTree = await createTestApp(runner, { style: 'scss' });
    const fileNames = [...new Set(cases.flatMap(migrationCase => migrationCase.files))];

    addTestFiles(
      appTree,
      Object.fromEntries(
        fileNames.map(fileName => [
          path.join(basePath, fileName),
          readFileSync(buildRelativeFromFile(path.join('files', fileName)), 'utf8')
        ])
      )
    );

    const context = runner.engine.createContext(
      runner.engine.createSchematic('migration-v51', runner.engine.createCollection(collectionPath))
    );
    const tree = await callRule(
      elementMigrationRule({ path: 'projects/app/src' }, migrationData),
      appTree,
      context
    ).toPromise();

    if (!tree) {
      throw new Error('elementMigrationRule returned undefined');
    }
    return tree;
  };

  beforeAll(async () => {
    [migratedTree, productionDataTree] = await Promise.all([
      runCases(migrationCases),
      runCases(productionDataCases, getElementMigrationData())
    ]);
  });

  const expectCase = (tree: Tree, migrationCase: MigrationCase): void => {
    for (const fileName of migrationCase.files) {
      const expected = readFileSync(
        buildRelativeFromFile(path.join('files', `expected.${fileName}`)),
        'utf8'
      );
      expect(tree.readText(path.join(basePath, fileName))).toEqual(expected);
    }
  };

  it.each(migrationCases)('$name', migrationCase => {
    expectCase(migratedTree, migrationCase);
  });

  it.each(productionDataCases)('$name', migrationCase => {
    expectCase(productionDataTree, migrationCase);
  });
});
