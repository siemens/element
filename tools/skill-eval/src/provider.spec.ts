/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OpenCode } from '@opencode/client';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type ProviderResponse } from 'promptfoo';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runSession, startOpenCode } from './agent/opencode';
import { verifyBrowser } from './grading/browser';
import { verifyProject } from './grading/project';
import ElementSkillProvider from './provider';
import { transcriptFixture } from './testing/transcript';
import { createTemporaryDirectory } from './utils';

vi.mock('./agent/opencode', () => ({ startOpenCode: vi.fn(), runSession: vi.fn() }));
vi.mock('./grading/project', () => ({ verifyProject: vi.fn() }));
vi.mock('./grading/browser', () => ({ verifyBrowser: vi.fn() }));

let temporary: string;
let output: string;

const call = (variant = 'working-tree'): Promise<ProviderResponse> =>
  new ElementSkillProvider({ id: 'file://src/provider.ts', config: { variant } }).callApi('Task', {
    prompt: { raw: 'Task', label: 'Task' },
    vars: { caseId: 'page-header' }
  });

const savedResult = async (variant = 'working-tree'): Promise<unknown> =>
  JSON.parse(await readFile(path.join(output, `page-header-${variant}-1/result.json`), 'utf8'));

beforeEach(async () => {
  vi.resetAllMocks();
  temporary = await createTemporaryDirectory();
  output = path.join(temporary, 'reports');
  const fixture = path.join(temporary, 'fixture');
  await mkdir(path.join(fixture, 'src'), { recursive: true });
  await mkdir(path.join(fixture, 'node_modules'));
  await writeFile(path.join(fixture, 'src/app.ts'), 'original');
  vi.stubEnv('SKILL_EVAL_FIXTURE', fixture);
  vi.stubEnv('SKILL_EVAL_OUTPUT', output);
  vi.stubEnv('SKILL_EVAL_PROVIDER', 'test');
  vi.stubEnv('SKILL_EVAL_MODEL', 'model');
  vi.stubEnv('SKILL_EVAL_API_KEY', 'test-key');
  vi.mocked(startOpenCode).mockResolvedValue({
    client: OpenCode.make({ baseUrl: 'http://example.test' }),
    close: vi.fn().mockResolvedValue(undefined)
  });
  vi.mocked(runSession).mockResolvedValue({ transcript: transcriptFixture() });
  vi.mocked(verifyProject).mockResolvedValue({
    checks: [{ name: 'npm run build', pass: true, reason: 'Passed' }],
    built: true
  });
  vi.mocked(verifyBrowser).mockResolvedValue([{ name: 'Behavior', pass: true, reason: 'Passed' }]);
});

afterEach(async () => {
  await rm(temporary, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe('Promptfoo OpenCode provider', () => {
  it('grades a verified trial, keeps its evidence, and removes the workspace', async () => {
    const response = await call();
    const options = vi.mocked(startOpenCode).mock.calls[0][0];

    expect(options.skillDirectory).toBe(path.join(output, 'skills/working-tree'));
    expect(response).toMatchObject({
      output: 'Implemented',
      cost: 0.12,
      metadata: {
        id: 'page-header-working-tree-1',
        grades: { routing: { pass: true }, task: { pass: true } }
      }
    });
    expect(await savedResult()).toMatchObject({ output: 'Implemented' });
    await expect(stat(options.directory)).rejects.toThrow('ENOENT');
  });

  it('does not configure or grade the skill for the baseline', async () => {
    const response = await call('none');

    expect(vi.mocked(startOpenCode).mock.calls[0][0].skillDirectory).toBeUndefined();
    expect(response.metadata?.grades).not.toHaveProperty('routing');
  });

  it('fails the task without running project scripts when protected files change', async () => {
    vi.mocked(runSession).mockImplementation(async (_client, _prompt, options) => {
      await writeFile(path.join(options.directory, 'package.json'), '{}');
      return { transcript: transcriptFixture() };
    });

    const response = await call();

    expect(response.metadata).toMatchObject({
      grades: { task: { pass: false } },
      checks: [expect.objectContaining({ name: 'Change scope', pass: false })]
    });
    expect(verifyProject).not.toHaveBeenCalled();
  });

  it('returns infrastructure failures as provider errors', async () => {
    vi.mocked(startOpenCode).mockRejectedValue(new Error('OpenCode startup timed out'));

    const response = await call();

    expect(response.error).toContain('startup timed out');
    expect(await savedResult()).toMatchObject({ error: expect.stringContaining('timed out') });
  });
});
