/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { evaluate, type ApiProvider } from 'promptfoo';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTemporaryDirectory } from './utils';

let temporary: string;

beforeEach(async () => {
  temporary = await createTemporaryDirectory();
  vi.stubEnv('SKILL_EVAL_OUTPUT', path.join(temporary, 'results'));
  vi.stubEnv('SKILL_EVAL_VARIANTS', 'working-tree,none');
});

afterEach(async () => {
  await rm(temporary, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe('Promptfoo evaluation configuration', () => {
  it('runs the routing and task assertions with Promptfoo', async () => {
    const { default: config } = await import('../promptfooconfig');
    const task = { pass: true, score: 1, reason: 'Passed' };
    const providers: ApiProvider[] = [
      {
        id: () => 'working-tree',
        callApi: async () => ({
          output: 'Implemented',
          metadata: { grades: { routing: { pass: true, score: 1, reason: 'Loaded' }, task } }
        })
      },
      {
        id: () => 'none',
        callApi: async () => ({ output: 'Implemented', metadata: { grades: { task } } })
      }
    ];

    const result = await evaluate(
      {
        description: config.description,
        prompts: ['{{request}}'],
        providers,
        tests: config.tests,
        sharing: false,
        writeLatestResults: false
      },
      { cache: false, maxConcurrency: 1, repeat: 1, silent: true }
    );

    const summary = await result.toEvaluateSummary();
    expect(summary.results.filter(entry => !entry.success)).toEqual([]);
    expect(summary.stats).toMatchObject({ successes: 6, failures: 0, errors: 0 });
  });
});
