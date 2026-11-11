/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdir, readlink, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTemporaryDirectory } from '../utils';
import { createWorkspace, sourceChanges } from './sources';

let root: string;

beforeEach(async () => {
  root = await createTemporaryDirectory();
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('workspace sources', () => {
  it('records additions, edits, and deletions', () => {
    expect(
      sourceChanges(
        { same: 'same', edited: 'before', deleted: 'before' },
        { same: 'same', edited: 'after', added: 'after' }
      )
    ).toEqual([
      { file: 'added', before: undefined, after: 'after' },
      { file: 'deleted', before: 'before', after: undefined },
      { file: 'edited', before: 'before', after: 'after' }
    ]);
  });

  it('copies sources, shares dependencies, and skips generated and agent files', async () => {
    const fixture = path.join(root, 'fixture');
    const workspace = path.join(root, 'workspace');
    for (const ignored of ['node_modules', 'dist', '.git', '.agents']) {
      await mkdir(path.join(fixture, ignored), { recursive: true });
      await writeFile(path.join(fixture, ignored, 'file.txt'), 'ignored');
    }
    await mkdir(path.join(fixture, 'src'));
    await writeFile(path.join(fixture, 'src/app.ts'), 'app');

    const sources = await createWorkspace(fixture, workspace);

    expect(Object.keys(sources)).toEqual([path.join('src', 'app.ts')]);
    expect(await readlink(path.join(workspace, 'node_modules'))).toBe(
      path.join(fixture, 'node_modules')
    );
    await expect(stat(path.join(workspace, 'dist'))).rejects.toThrow('ENOENT');
  });
});
