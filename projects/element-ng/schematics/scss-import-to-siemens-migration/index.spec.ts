/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp, readLines } from '../utils';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);
describe('scss-import-to-siemens migration', () => {
  const name = 'migrate-scss-imports-to-siemens';
  const globalStyle = 'projects/app/src/styles.scss';
  const scssFile = '/projects/app/src/app/fake-1.scss';
  let runner: SchematicTestRunner;
  let appTree: Tree;

  const runFileMigration = async (file: string, original: string[]): Promise<string[]> => {
    addTestFiles(appTree, {
      [file]: original.join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    return readLines(tree, file);
  };

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it(`should remove global style @use '@simpl/element-theme/src/theme';`, async () => {
    const originalContent = [`// Import theme`, `@use '@simpl/element-theme/src/theme';`];
    const actual = await runFileMigration(globalStyle, originalContent);
    expect(actual).not.toContain(`@use '@simpl/element-theme/src/theme';`);
  });

  it(`should not modify node_modules files';`, async () => {
    const originalContent = [`// Import theme`, `@use '@simpl/element-theme/src/theme';`];
    const actual = await runFileMigration('node_modules/package/styles.scss', originalContent);
    expect(actual).toEqual(originalContent);
  });

  it(`should remove global styles @use '@simpl/element-theme/...`, async () => {
    const originalContent = [
      `// Import theme`,
      `@use '@simpl/element-theme/src/theme' with (`,
      `  // comment`,
      `  $siemens-font-path: $siemens-font-path`,
      `);`
    ];
    const actual = await runFileMigration(globalStyle, originalContent);
    expect(actual).not.toContain(
      [
        `@use '@simpl/element-theme/src/theme' with (`,
        `  // comment`,
        `  $siemens-font-path: $siemens-font-path`,
        `);`
      ].join('\n')
    );
  });

  it(`should apply global theme styles`, async () => {
    const originalContent = [
      `// Load Element icons`,
      `@use '@simpl/element-icons/dist/style/simpl-element-icons';`
    ];
    const expected = [
      `@use '@siemens/element-theme/src/theme' with (`,
      `  $element-theme-default: 'siemens-brand',`,
      `  $element-themes: (`,
      `    'siemens-brand',`,
      `    'element'`,
      `  )`,
      `);`,
      `@use '@siemens/element-ng/element-ng';`,
      `@use '@siemens/element-theme/src/styles/themes';`,
      `@use '@simpl/brand/dist/element-theme-siemens-brand-light' as brand-light;`,
      `@use '@simpl/brand/dist/element-theme-siemens-brand-dark' as brand-dark;`,
      `@include themes.make-theme(brand-light.$tokens, 'siemens-brand');`,
      `@include themes.make-theme(brand-dark.$tokens, 'siemens-brand', true);`,
      `@use '@simpl/brand/assets/fonts/styles/siemens-sans';`,
      `// Load Element icons`,
      `@use '@simpl/element-icons/dist/style/simpl-element-icons';`
    ];
    const actual = await runFileMigration(globalStyle, originalContent);
    expect(actual).toEqual(expected);
  });

  it(`shouldn't touch global theme styles`, async () => {
    const originalContent = [
      `// Load Siemens fonts`,
      `@use '@simpl/brand/assets/fonts/styles/siemens-sans';`,
      `// Load Element icons`,
      `@use '@simpl/element-icons/dist/style/simpl-element-icons';`,
      `// Use Element theme`,
      `@use '@siemens/element-theme/src/theme' with (`,
      `    $element-theme-default: 'siemens-brand',`,
      `    $element-themes: (`,
      `        'siemens-brand',`,
      `        'element'`,
      `    )`,
      `);`,
      `// Use Element components`,
      `@use '@siemens/element-ng/element-ng';`,
      `// Actually build the siemens-brand theme`,
      `@use '@siemens/element-theme/src/styles/themes';`,
      `@use '@simpl/brand/dist/element-theme-siemens-brand-light' as brand-light;`,
      `@use '@simpl/brand/dist/element-theme-siemens-brand-dark' as brand-dark;`,
      `@include themes.make-theme(brand-light.$tokens, 'siemens-brand');`,
      `@include themes.make-theme(brand-dark.$tokens, 'siemens-brand', true);`,
      `// Load Element icons`,
      `@use '@simpl/element-icons/dist/style/simpl-element-icons';`
    ];
    const actual = await runFileMigration(globalStyle, originalContent);
    expect(actual).toEqual(originalContent);
  });

  it('should replace scss import @simpl/element-theme/...', async () => {
    const originalContent = [
      `@use 'sass:map';`,
      `@import '@simpl/element-theme/src/styles/variables';`,
      `@import '@simpl/element-theme/src/styles/all-variables';`
    ];
    const expected = [
      `@use 'sass:map';`,
      `@import '@siemens/element-theme/src/styles/variables';`,
      `@import '@siemens/element-theme/src/styles/all-variables';`
    ];
    const actual = await runFileMigration(scssFile, originalContent);
    expect(actual).toEqual(expected);
  });
});
