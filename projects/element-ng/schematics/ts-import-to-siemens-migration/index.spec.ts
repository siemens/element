/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp, readLines, removeTestFiles } from '../utils';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../collection.json'
);
describe('ts-import-to-siemens migration', () => {
  const name = 'migrate-ts-imports-to-siemens';
  const sourceFile = '/projects/app/src/app/fake-1.ts';
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it('should migrate to subpath', async () => {
    addTestFiles(appTree, {
      [sourceFile]: `import { SiSliderComponent } from '@simpl/element-ng';`
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([`import { SiSliderComponent } from '@siemens/element-ng/slider';`]);
  });

  it('should merge imports', async () => {
    addTestFiles(appTree, {
      [sourceFile]: [
        `import { SiAccordionModule } from '@simpl/element-ng';`,
        `import { SiCollapsiblePanelComponent } from '@simpl/element-ng/accordion';`
      ].join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiAccordionModule, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';`
    ]);
  });

  it('should order imports', async () => {
    addTestFiles(appTree, {
      [sourceFile]: [
        `import { SiDateInputDirective, SiDatepickerComponent } from '@simpl/element-ng/datepicker';`,
        `import { SiCollapsiblePanelComponent } from '@simpl/element-ng/accordion';`
      ].join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';`,
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
    ]);
  });

  it('should order symbols', async () => {
    addTestFiles(appTree, {
      [sourceFile]: `
  import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
    ]);
  });

  it('should not blindly migrate the path which starts from @simpl', async () => {
    addTestFiles(appTree, {
      [sourceFile]: [
        `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`,
        `import { SomeComponent } from '@simpl/buildings-ng';`
      ].join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
      `import { SomeComponent } from '@simpl/buildings-ng';`
    ]);
  });

  it('should ignore unknown components', async () => {
    addTestFiles(appTree, {
      [sourceFile]: `import { SiUnknownComponent } from '@simpl/element-ng';`
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([`import { SiUnknownComponent } from '@simpl/element-ng';`]);
  });

  it('should handle MenuItem from common subpath without migrating it to the new MenuItem from menu subpath', async () => {
    const files = {
      [sourceFile]: [
        `import { MenuItem } from '@simpl/element-ng';`,
        `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
      ].join('\n')
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { MenuItem } from '@siemens/element-ng/common';`,
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
    ]);
  });

  it('should handle MenuItem from menu subpath', async () => {
    addTestFiles(appTree, {
      [sourceFile]: [
        `import { MenuItem } from '@simpl/element-ng/menu';`,
        `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
      ].join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
      `import { MenuItem } from '@siemens/element-ng/menu';`
    ]);
  });

  it('should preserve non-@simpl imports and ensure other imports are untouched', async () => {
    addTestFiles(appTree, {
      [sourceFile]: [
        `import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`,
        `import { SomeComponent } from '@simpl/buildings-ng';`,
        `import { of } from 'rxjs';`
      ].join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
      `import { SomeComponent } from '@simpl/buildings-ng';`,
      `import { of } from 'rxjs';`
    ]);
  });

  it('should migrate translation symbol if imported from `@simpl/element-ng`', async () => {
    addTestFiles(appTree, {
      [sourceFile]: [
        `import { SiTranslatePipe, TranslatableString } from '@simpl/element-ng';`
      ].join('\n')
    });
    const tree = await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual([
      `import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';`
    ]);
  });

  it('should throw error if no tsconfig could be found', async () => {
    removeTestFiles(appTree, [
      'projects/app/tsconfig.app.json',
      'projects/app/tsconfig.spec.json',
      'projects/second-app/tsconfig.app.json',
      'projects/second-app/tsconfig.spec.json'
    ]);

    try {
      await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    } catch (e: any) {
      expect(e.message).toMatch('Could not find any tsconfig file. Cannot run the migration.');
    }
  });

  it('should throw error if no angular.json could be found', async () => {
    removeTestFiles(appTree, ['angular.json']);
    try {
      await runner.runSchematic(name, { path: 'projects/app/src' }, appTree);
    } catch (e: any) {
      expect(e.message).toMatch('Path "/angular.json" does not exist.');
    }
  });
});
