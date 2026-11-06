/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTemporaryDirectory } from './utils';
import { variantId, variantSpecs, writeSkillSnapshots } from './variants';

let output: string;

beforeEach(async () => {
  output = await createTemporaryDirectory();
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(output, { recursive: true, force: true });
});

describe('skill variants', () => {
  it('derives filesystem-safe IDs and rejects option-like or duplicate entries', () => {
    expect(variantId('origin/main')).toBe('origin-main');

    vi.stubEnv('SKILL_EVAL_VARIANTS', '-p');
    expect(() => variantSpecs()).toThrow('SKILL_EVAL_VARIANTS');

    vi.stubEnv('SKILL_EVAL_VARIANTS', 'HEAD, HEAD');
    expect(() => variantSpecs()).toThrow('twice');
  });

  it('snapshots the working tree and committed skills but not the baseline', async () => {
    vi.stubEnv('SKILL_EVAL_VARIANTS', 'working-tree, HEAD, none');

    await writeSkillSnapshots(output);

    expect((await readdir(path.join(output, 'skills'))).sort()).toEqual(['HEAD', 'working-tree']);
    expect(await readFile(path.join(output, 'skills/HEAD/element/SKILL.md'), 'utf8')).toContain(
      'name: element'
    );
  });
});
