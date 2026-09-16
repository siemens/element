/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../utils/index.js';

const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../migration.json');

describe('ng-update color token rename', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('@siemens/element-ng', collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  it('should rename Sass and CSS color tokens and leave typography untouched', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/styles.scss': `.panel {
  color: $si-sys-text-primary;
  background: $si-sys-background-0;
  border-color: var(--si-sys-border-1);
  box-shadow: $si-sys-color-effects-shadow-2;
  font-family: var(--si-sys-typography-body);
}

.background-0 {
  background: inherit;
}
`,
      '/projects/app/src/theme.ts': `export const token = '--si-sys-text-primary';
export const colorToken = 'si-sys-data-categorical-10';
export const alreadyRenamed = '$si-sys-color-background-1';
`
    });

    const tree = await runner.runSchematic('migration-v51-0-1', {}, appTree);

    expect(tree.readContent('/projects/app/src/styles.scss')).toBe(`.panel {
  color: $si-sys-color-text-primary;
  background: $si-sys-color-background-0;
  border-color: var(--si-sys-color-border-1);
  box-shadow: $si-sys-color-effects-shadow-2;
  font-family: var(--si-sys-typography-body);
}

.background-0 {
  background: inherit;
}
`);
    expect(tree.readContent('/projects/app/src/theme.ts')).toBe(
      `export const token = '--si-sys-color-text-primary';
export const colorToken = 'si-sys-color-data-categorical-10';
export const alreadyRenamed = '$si-sys-color-background-1';
`
    );
  });

  it('should log the v51.0.1 start message', async () => {
    const logSpy = vi.fn();
    runner.logger.subscribe(logSpy);

    await runner.runSchematic('migration-v51-0-1', {}, appTree);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Starting color token rename for v51.0.1')
      })
    );
  });
});
