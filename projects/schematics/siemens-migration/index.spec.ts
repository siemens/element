/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { addTestFiles, createTestApp, removeTestFiles } from '../utils';

const collectionPath = path.join(__dirname, '../collection.json');

describe('siemensMigration', () => {
  const name = 'siemens-migration';
  const sourceFile = '/projects/app/src/app/fake-1.ts';
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner);
  });

  it('should migrate to subpath', async () => {
    const files = {
      [sourceFile]: `import { SiSliderComponent } from '@simpl/element-ng';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([`import { SiSliderComponent } from '@siemens/element-ng/slider';`]);
  });

  it('should merge imports', async () => {
    const files = {
      [sourceFile]: `
import { SiAccordionModule } from '@simpl/element-ng';
import { SiCollapsiblePanelComponent } from '@simpl/element-ng/accordion';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { SiAccordionModule, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';`
    ]);
  });

  it('should order imports', async () => {
    const files = {
      [sourceFile]: `
import { SiDateInputDirective, SiDatepickerComponent } from '@simpl/element-ng/datepicker';
import { SiCollapsiblePanelComponent } from '@simpl/element-ng/accordion';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';`,
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
    ]);
  });

  it('should order symbols', async () => {
    const files = {
      [sourceFile]: `
import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
    ]);
  });

  it('should not blindly migrate the path which starts from @simpl', async () => {
    const files = {
      [sourceFile]: `
import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';
import { SomeComponent } from '@simpl/buildings-ng';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
      `import { SomeComponent } from '@simpl/buildings-ng';`
    ]);
  });

  it('should ignore unknown components', async () => {
    const files = {
      [sourceFile]: `import { SiUnknownComponent } from '@simpl/element-ng';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([`import { SiUnknownComponent } from '@simpl/element-ng';`]);
  });

  it('should handle MenuItem from common subpath without migrating it to the new MenuItem from menu subpath', async () => {
    const files = {
      [sourceFile]: `import { MenuItem } from '@simpl/element-ng';
      import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { MenuItem } from '@siemens/element-ng/common';`,
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`
    ]);
  });

  it('should handle MenuItem from menu subpath', async () => {
    const files = {
      [sourceFile]: `import { MenuItem } from '@simpl/element-ng/menu';
      import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
      `import { MenuItem } from '@siemens/element-ng/menu';`
    ]);
  });

  it('should preserve non-@simpl imports and ensure other imports are untouched', async () => {
    const files = {
      [sourceFile]: `
import { SiDatepickerComponent, SiDateInputDirective } from '@simpl/element-ng/datepicker';
import { SomeComponent } from '@simpl/buildings-ng';
import { of } from 'rxjs';`
    };
    addTestFiles(appTree, files);
    const tree = await runner.runSchematic(
      'siemens-migration',
      { path: 'projects/app/src' },
      appTree
    );
    const imports = tree
      .readContent(sourceFile)
      .split('\n')
      .filter(l => l.length > 0);
    expect(imports).toEqual([
      `import { SiDateInputDirective, SiDatepickerComponent } from '@siemens/element-ng/datepicker';`,
      `import { SomeComponent } from '@simpl/buildings-ng';`,
      `import { of } from 'rxjs';`
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
      await runner.runSchematic('siemens-migration', { path: 'projects/app/src' }, appTree);
    } catch (e) {
      expect(e.message).toMatch('Could not find any tsconfig file. Cannot run the migration.');
    }
  });

  it('should throw error if no angular.json could be found', async () => {
    removeTestFiles(appTree, ['angular.json']);
    try {
      await runner.runSchematic('siemens-migration', { path: 'projects/app/src' }, appTree);
    } catch (e) {
      expect(e.message).toMatch('Could not find angular.json');
    }
  });
});
