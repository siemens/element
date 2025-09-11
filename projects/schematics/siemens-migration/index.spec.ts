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
  const sourceFile = '/projects/app/src/app/fake-1.ts';
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
});
