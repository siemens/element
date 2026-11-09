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
});

afterEach(async () => {
  await rm(temporary, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe('Promptfoo evaluation configuration', () => {
  it.each([true, false])('surfaces check metrics without changing task pass=%s', async pass => {
    const { default: config } = await import('../promptfooconfig');
    expect(config.providers).toHaveLength(1);

    const namedScores = { lint: 1, build: 1, test: 1, behavior: 0, accessibility: 1, layout: 1 };
    const task = { pass, score: pass ? 1 : 0, reason: pass ? 'Passed' : 'Failed', namedScores };
    const providers: ApiProvider[] = [
      {
        id: () => 'element',
        callApi: async () => ({
          output: 'Implemented',
          metadata: { grades: { routing: { pass: true, score: 1, reason: 'Loaded' }, task } }
        })
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
    expect(summary.results).toHaveLength(3);
    for (const entry of summary.results) {
      expect(entry).toMatchObject({
        success: pass,
        score: pass ? 1 : 0.5,
        namedScores: { routing: 1, task: task.score, ...namedScores }
      });
    }
    expect(summary.stats).toMatchObject({
      successes: pass ? 3 : 0,
      failures: pass ? 0 : 3,
      errors: 0
    });
  });
});
