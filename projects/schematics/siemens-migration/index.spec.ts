/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { addTestFiles, createTestApp, readLines, removeTestFiles } from '../utils';

const collectionPath = path.join(
  process.cwd(),
  'dist/@siemens/element-ng/schematics/collection.json'
);

describe('siemensMigration', () => {
  const name = 'siemens-migration';
  const globalStyle = 'projects/app/src/styles.scss';
  const sourceFile = '/projects/app/src/app/fake-1.ts';
  const scssFile = '/projects/app/src/app/fake-1.scss';

  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  describe('ts import migration', () => {
    test('should migrate to subpath', async () => {
      addTestFiles(appTree, {
        [sourceFile]: `import { SiSliderComponent } from '@simpl/element-ng';`
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([`import { SiSliderComponent } from '@siemens/element-ng/slider';`]);
    });

    test('should merge imports', async () => {
      addTestFiles(appTree, {
        [sourceFile]: [
          `import { SiAccordionModule } from '@simpl/element-ng';`,
          `import { SiCollapsiblePanelComponent } from '@simpl/element-ng/accordion';`
        ].join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { SiAccordionModule, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';`
      ]);
    });

    test('should order imports', async () => {
      addTestFiles(appTree, {
        [sourceFile]: [
          `import { SiDateInputDirective, SiDatepickerComponent } from '@simpl/element-ng/datepicker';`,
          `import { SiCollapsiblePanelComponent } from '@simpl/element-ng/accordion';`
        ].join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';`,
        `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
      ]);
    });

    test('should order symbols', async () => {
      addTestFiles(appTree, {
        [sourceFile]: `
  import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
      ]);
    });

    test('should not blindly migrate the path which starts from @simpl', async () => {
      addTestFiles(appTree, {
        [sourceFile]: [
          `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`,
          `import { SomeComponent } from '@simpl/buildings-ng';`
        ].join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
        `import { SomeComponent } from '@simpl/buildings-ng';`
      ]);
    });

    test('should ignore unknown components', async () => {
      addTestFiles(appTree, {
        [sourceFile]: `import { SiUnknownComponent } from '@simpl/element-ng';`
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([`import { SiUnknownComponent } from '@simpl/element-ng';`]);
    });

    test('should handle MenuItem from common subpath without migrating it to the new MenuItem from menu subpath', async () => {
      const files = {
        [sourceFile]: [
          `import { MenuItem } from '@simpl/element-ng';`,
          `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
        ].join('\n')
      };
      addTestFiles(appTree, files);
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { MenuItem } from '@siemens/element-ng/common';`,
        `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
      ]);
    });

    test('should handle MenuItem from menu subpath', async () => {
      addTestFiles(appTree, {
        [sourceFile]: [
          `import { MenuItem } from '@simpl/element-ng/menu';`,
          `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
        ].join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
        `import { MenuItem } from '@siemens/element-ng/menu';`
      ]);
    });

    test('should preserve non-@simpl imports and ensure other imports are untouched', async () => {
      addTestFiles(appTree, {
        [sourceFile]: [
          `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`,
          `import { SomeComponent } from '@simpl/buildings-ng';`,
          `import { of } from 'rxjs';`
        ].join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = readLines(tree, sourceFile);
      expect(actual).toEqual([
        `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
        `import { SomeComponent } from '@simpl/buildings-ng';`,
        `import { of } from 'rxjs';`
      ]);
    });

    test('should throw error if no tsconfig could be found', async () => {
      removeTestFiles(appTree, [
        'projects/app/tsconfig.app.json',
        'projects/app/tsconfig.spec.json',
        'projects/second-app/tsconfig.app.json',
        'projects/second-app/tsconfig.spec.json'
      ]);

      try {
        await runner.runSchematic('siemens-migration', { path: 'projects/app/src' }, appTree);
      } catch (e) {
        expect(e.message).toMatch('Could not find any tsconfig file. Cannot run the migration.');
      }
    });

    test('should throw error if no angular.json could be found', async () => {
      removeTestFiles(appTree, ['angular.json']);
      try {
        await runner.runSchematic('siemens-migration', { path: 'projects/app/src' }, appTree);
      } catch (e) {
        expect(e.message).toMatch('Could not find angular.json');
      }
    });
  });

  describe('style migration', () => {
    test(`should remove global style @use '@simpl/element-theme/src/theme';`, async () => {
      const originalContent = [`// Import theme`, `@use '@simpl/element-theme/src/theme';`];
      addTestFiles(appTree, {
        [globalStyle]: originalContent.join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = tree.readContent(globalStyle);
      expect(actual).not.toContain(`@use '@simpl/element-theme/src/theme';`);
    });

    test(`should remove global styles @use '@simpl/element-theme/...`, async () => {
      const originalContent = [
        `// Import theme`,
        `@use '@simpl/element-theme/src/theme' with (`,
        `  // comment`,
        `  $siemens-font-path: $siemens-font-path`,
        `);`
      ];
      addTestFiles(appTree, {
        [globalStyle]: originalContent.join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
      const actual = tree.readContent(globalStyle);
      expect(actual).not.toContain(
        [
          `@use '@simpl/element-theme/src/theme' with (`,
          `  // comment`,
          `  $siemens-font-path: $siemens-font-path`,
          `);`
        ].join('\n')
      );
    });

    test(`should apply global theme styles`, async () => {
      const originalContent = [
        `// Load Element icons`,
        `@use '@simpl/element-icons/dist/style/simpl-element-icons';`
      ];

      addTestFiles(appTree, {
        [globalStyle]: originalContent.join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );
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
      const actual = readLines(tree, globalStyle);
      expect(actual).toEqual(expected);
    });

    test(`shouldn't touch global theme styles`, async () => {
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
      addTestFiles(appTree, {
        [globalStyle]: originalContent.join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );

      const actual = readLines(tree, globalStyle);
      expect(actual).toEqual(originalContent);
    });

    test('should replace scss import @simpl/element-theme/...', async () => {
      const originalContent = [
        `@use 'sass:map';`,
        `@import '@simpl/element-theme/src/styles/variables';`,
        `@import '@simpl/element-theme/src/styles/all-variables';`
      ];
      addTestFiles(appTree, {
        [scssFile]: originalContent.join('\n')
      });
      const tree = await runner.runSchematic(
        'siemens-migration',
        { path: 'projects/app/src' },
        appTree
      );

      const expected = [
        `@use 'sass:map';`,
        `@import '@siemens/element-theme/src/styles/variables';`,
        `@import '@siemens/element-theme/src/styles/all-variables';`
      ];
      const actual = readLines(tree, scssFile);
      expect(actual).toEqual(expected);
    });
  });
});
