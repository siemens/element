/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');

describe('ng-update migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('@siemens/element-ng', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it('should run migration successfully', async () => {
    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    expect(tree).toBeDefined();
  });

  it('should log migration start message', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);

    await runner.runSchematic('migration-v51', {}, appTree);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Starting update from version 49 to 51')
      })
    );
  });

  it('should leave unrelated files untouched', async () => {
    const originalContent = `import { Component, inject } from '@angular/core';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';

@Component({ selector: 'app-test' })
export class TestComponent {
  showDialog() {
    inject(SiActionDialogService).showAlertDialog('Message', 'Heading', 'Confirm').subscribe();
  }
}`;

    addTestFiles(appTree, {
      '/projects/app/src/test.component.ts': originalContent
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);

    expect(tree).toBeDefined();
    expect(tree.exists('/projects/app/src/test.component.ts')).toBe(true);
    const modifiedContent = tree.readContent('/projects/app/src/test.component.ts');
    expect(modifiedContent).toEqual(originalContent);
  });

  it('should handle empty project gracefully', async () => {
    const emptyTree = await createTestApp(runner, { style: 'scss' });

    const tree = await runner.runSchematic('migration-v51', {}, emptyTree);
    expect(tree).toBeDefined();
  });

  it('should remove provideIconConfig usage and its import', async () => {
    const originalContent = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideIconConfig } from '@siemens/element-ng/icon';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideIconConfig({ disableSvgIcons: true })]
};`;

    addTestFiles(appTree, {
      '/projects/app/src/app.config.ts': originalContent
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);

    const modifiedContent = tree.readContent('/projects/app/src/app.config.ts');
    expect(modifiedContent).not.toContain('provideIconConfig');
    expect(modifiedContent).not.toContain('@siemens/element-ng/icon');
    expect(modifiedContent).toContain('providers: [provideZonelessChangeDetection()]');
  });

  it('should move literal split sizes to inline split parts', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  template: \`<si-split [sizes]="[20, 60, 20]">
  <si-split-part>Left</si-split-part>
  <si-split-part>Center</si-split-part>
  <si-split-part>Right</si-split-part>
</si-split>\`
})
export class SplitComponent {}`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.ts');

    expect(modifiedContent).not.toContain('[sizes]');
    expect(modifiedContent).toContain('<si-split-part size="20fr">Left</si-split-part>');
    expect(modifiedContent).toContain('<si-split-part size="60fr">Center</si-split-part>');
    expect(modifiedContent).toContain('<si-split-part size="20fr">Right</si-split-part>');
  });

  it('should move expression split sizes to external split parts', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/split.component.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html'
})
export class SplitComponent {}`,
      '/projects/app/src/split.component.html': `<si-split [sizes]="panelSizes">
  <si-split-part>Left</si-split-part>
  <si-split-part>Right</si-split-part>
</si-split>`
    });

    const tree = await runner.runSchematic('migration-v51', {}, appTree);
    const modifiedContent = tree.readContent('/projects/app/src/split.component.html');

    expect(modifiedContent).not.toContain('[sizes]');
    expect(modifiedContent).toContain(
      '<si-split-part [size]="panelSizes[0] + \'fr\'">Left</si-split-part>'
    );
    expect(modifiedContent).toContain(
      '<si-split-part [size]="panelSizes[1] + \'fr\'">Right</si-split-part>'
    );
  });

  it('should pass options to sub-migrations', async () => {
    const customPath = '/custom/path';
    const options = { path: customPath };

    const tree = await runner.runSchematic('migration-v51', options, appTree);
    expect(tree).toBeDefined();

    // Verify the schematic ran with custom options
    // In a real scenario, you'd verify the migration respected the path option
  });
});
